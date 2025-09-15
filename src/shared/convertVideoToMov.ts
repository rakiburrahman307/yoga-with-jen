import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import AppError from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// Video conversion using ffmpeg-static

// Create temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}
export // Video conversion using ffmpeg-static
const convertVideoToMov = async (videoBuffer: Buffer, originalName: string): Promise<Buffer> => {
     if (!ffmpegStatic) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'FFmpeg binary not available');
     }

     const inputPath = path.join(tempDir, `input_${Date.now()}_${originalName}`);
     const outputPath = path.join(tempDir, `output_${Date.now()}.mov`);

     return new Promise<Buffer>((resolve, reject) => {
          try {
               // Write input file to temp directory
               fs.writeFileSync(inputPath, videoBuffer);

               console.log(`Converting video: ${originalName}`);

               // Spawn FFmpeg process with optimized settings
               const ffmpeg = spawn(ffmpegStatic as string, [
                    '-i', inputPath,
                    '-c:v', 'libx264',           // Video codec
                    '-preset', 'ultrafast',      // Fastest encoding preset
                    '-crf', '28',                // Lower quality for faster conversion (28 is acceptable)
                    '-c:a', 'aac',               // Audio codec
                    '-b:a', '128k',              // Audio bitrate
                    '-movflags', '+faststart',   // Optimize for web streaming
                    '-f', 'mov',                 // Output format
                    '-y',                        // Overwrite output file
                    '-progress', 'pipe:1',       // Progress to stdout
                    outputPath
               ]);

               let errorOutput = '';
               let lastProgressTime = Date.now();

               // Track conversion progress
               ffmpeg.stdout?.on('data', (data: Buffer) => {
                    const output = data.toString();
                    lastProgressTime = Date.now();
                    
                    // Look for time progress
                    const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
                    if (timeMatch) {
                         const [, hours, minutes, seconds] = timeMatch;
                         console.log(`Conversion progress: ${hours}:${minutes}:${seconds}`);
                    }
               });
               // Capture error output for debugging
               ffmpeg.stderr?.on('data', (data: Buffer) => {
                    const output = data.toString();
                    errorOutput += output;
                    lastProgressTime = Date.now();
                    
                    // Also check stderr for time progress (FFmpeg outputs progress here too)
                    const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
                    if (timeMatch) {
                         const [, hours, minutes, seconds] = timeMatch;
                         console.log(`Conversion progress: ${hours}:${minutes}:${seconds}`);
                    }
               });

               // Handle successful completion
               ffmpeg.on('close', (code: number | null) => {
                    try {
                         if (code === 0) {
                              console.log('Video conversion completed successfully');
                              
                              // Read the converted file
                              const outputBuffer = fs.readFileSync(outputPath);
                              
                              // Clean up temp files
                              fs.unlinkSync(inputPath);
                              fs.unlinkSync(outputPath);
                              
                              resolve(outputBuffer);
                         } else {
                              console.error('FFmpeg conversion failed with code:', code);
                              console.error('FFmpeg error output:', errorOutput);
                              
                              // Clean up on error
                              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                              
                              reject(new AppError(
                                   StatusCodes.INTERNAL_SERVER_ERROR, 
                                   `Video conversion failed with exit code ${code}`
                              ));
                         }
                    } catch {
                         // Clean up on error
                         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                         if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                         
                         reject(new AppError(
                              StatusCodes.INTERNAL_SERVER_ERROR, 
                              'Failed to process converted video file'
                         ));
                    }
               });

               // Handle process errors
               ffmpeg.on('error', (error: Error) => {
                    console.error('FFmpeg process error:', error);
                    
                    // Clean up on error
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                    
                    reject(new AppError(
                         StatusCodes.INTERNAL_SERVER_ERROR, 
                         `FFmpeg process error: ${error.message}`
                    ));
               });

               // Dynamic timeout based on file size (more generous for large files)
               const fileSizeMB = videoBuffer.length / (1024 * 1024);
               const timeoutMinutes = Math.max(10, Math.ceil(fileSizeMB / 10)); // At least 10 minutes, +1 minute per 10MB
               const timeoutMs = timeoutMinutes * 60 * 1000;
               
               console.log(`Setting timeout to ${timeoutMinutes} minutes for ${fileSizeMB.toFixed(1)}MB video`);

               // Set timeout with progress checking
               const timeout = setTimeout(() => {
                    const timeSinceLastProgress = Date.now() - lastProgressTime;
                    
                    // Only timeout if no progress for 10 minutes
                    if (timeSinceLastProgress > 600000) { // 10 minutes
                         console.log('No progress detected for 10 minutes, terminating...');
                         ffmpeg.kill('SIGKILL');
                         
                         // Clean up on timeout
                         if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                         if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                         
                         reject(new AppError(
                              StatusCodes.INTERNAL_SERVER_ERROR, 
                              'Video conversion timed out - no progress detected'
                         ));
                    } else {
                         console.log('Conversion still in progress, extending timeout...');
                         // Don't kill the process, just log
                    }
               }, timeoutMs);

               // Clear timeout when process completes
               ffmpeg.on('close', () => clearTimeout(timeout));
               ffmpeg.on('error', () => clearTimeout(timeout));

          } catch (error) {
               console.error('Video conversion setup error:', error);
               
               // Clean up on setup error
               if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
               if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
               
               reject(new AppError(
                    StatusCodes.INTERNAL_SERVER_ERROR, 
                    `Video conversion setup failed: ${error}`
               ));
          }
     });
};
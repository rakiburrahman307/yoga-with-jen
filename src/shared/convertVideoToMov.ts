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
export const convertVideoToMov = async (videoBuffer: Buffer, originalName: string): Promise<Buffer> => {
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
                '-preset', 'fast',           // Encoding preset (fast conversion)
                '-crf', '23',                // Quality setting (23 is good quality)
                '-c:a', 'aac',               // Audio codec
                '-b:a', '128k',              // Audio bitrate
                '-movflags', '+faststart',   // Optimize for web streaming
                '-f', 'mov',                 // Output format
                '-y',                        // Overwrite output file
                outputPath
            ]);

            let errorOutput = '';

            // Capture error output for debugging
            ffmpeg.stderr?.on('data', (data: Buffer) => {
                errorOutput += data.toString();
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

            // Set timeout to prevent hanging (5 minutes)
            const timeout = setTimeout(() => {
                ffmpeg.kill('SIGKILL');

                // Clean up on timeout
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

                reject(new AppError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Video conversion timed out'
                ));
            }, 300000); // 5 minutes

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
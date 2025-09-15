import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { BunnyStorageHandeler } from '../../helpers/BunnyStorageHandeler';
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const allowedMimeTypes: Record<string, string[]> = {
     image: ['image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif'],
     audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/aac'],
     video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/avi', 'video/mkv'],
     document: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'application/rtf',
          'application/zip',
          'application/x-7z-compressed',
          'application/x-rar-compressed',
     ],
     others: ['application/octet-stream', 'application/zip', 'application/x-7z-compressed', 'application/x-rar-compressed'],
     thumbnail: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Create temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
     fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
     storage: storage,
     limits: { fileSize: 2024 * 1024 * 1024 }, // 2GB max file size
     fileFilter: (req: Request, file: any, cb: any) => {
          const fieldName = file.fieldname;
          let allowedTypes = [];

          if (allowedMimeTypes[fieldName]) {
               allowedTypes = allowedMimeTypes[fieldName];
          } else {
               return cb(new AppError(StatusCodes.BAD_REQUEST, 'Invalid file type'));
          }

          if (allowedTypes.includes(file.mimetype)) {
               cb(null, true);
          } else {
               return cb(new AppError(StatusCodes.BAD_REQUEST, `Invalid file type. Only ${allowedTypes.join(', ')} files are allowed.`));
          }
     },
}).fields([
     { name: 'video', maxCount: 1 },
     { name: 'thumbnail', maxCount: 1 },
     { name: 'image', maxCount: 5 },
     { name: 'audio', maxCount: 1 },
     { name: 'document', maxCount: 1 },
     { name: 'others', maxCount: 1 },
]);

// Video conversion using ffmpeg-static
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

               const ffmpeg = spawn(ffmpegStatic as string, [
                    '-i', inputPath,              // Input file
                    '-c:v', 'copy',               // Copy the video stream (no re-encoding)
                    '-c:a', 'copy',               // Copy the audio stream (no re-encoding)
                    '-f', 'mov',                  // Output format: MOV container
                    '-y',                         // Overwrite output file
                    outputPath                    // Output file path
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

const fileUploadHandlerbunny = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     upload(req, res, async (error: any) => {
          if (error) {
               return next(error);
          }

          if (req.files) {
               const fileUrls: Record<string, string> = {};
               const files = req.files as { [key: string]: Express.Multer.File[] };

               try {
                    // Handle video upload if present
                    if (files['video']) {
                         const videoFile = files['video'][0];
                         console.log('Processing video file:', videoFile.originalname);

                         try {
                              // Convert video to MOV format
                              const convertedBuffer = await convertVideoToMov(videoFile.buffer, videoFile.originalname);

                              // Generate output filename with .mov extension
                              const outputFilename = videoFile.originalname.replace(/\.[^/.]+$/, '.mov');

                              // Upload converted video to Bunny Storage
                              fileUrls.videoUrl = await BunnyStorageHandeler.uploadVideoToBunny(
                                   convertedBuffer,
                                   outputFilename,
                                   'videos'
                              );

                              console.log('Video converted and uploaded successfully');
                         } catch (conversionError) {
                              console.error('Video conversion failed, uploading original:', conversionError);

                              // Fallback: upload original video without conversion
                              fileUrls.videoUrl = await BunnyStorageHandeler.uploadVideoToBunny(
                                   videoFile.buffer,
                                   videoFile.originalname,
                                   'videos'
                              );

                              console.log('Original video uploaded as fallback');
                         }
                    }

                    // Handle image upload if present
                    if (files['image']) {
                         const imageFile = files['image'][0];
                         fileUrls.imageUrl = await BunnyStorageHandeler.uploadToBunny(imageFile, 'images');
                    }

                    // Handle thumbnail upload if present
                    if (files['thumbnail']) {
                         const thumbnailFile = files['thumbnail'][0];
                         fileUrls.thumbnailUrl = await BunnyStorageHandeler.uploadToBunny(thumbnailFile, 'thumbnails');
                    }

                    // Handle document upload if present
                    if (files['document']) {
                         const documentFile = files['document'][0];
                         fileUrls.documentUrl = await BunnyStorageHandeler.uploadToBunny(documentFile, 'documents');
                    }

                    // Handle audio upload if present
                    if (files['audio']) {
                         const audioFile = files['audio'][0];
                         fileUrls.audioUrl = await BunnyStorageHandeler.uploadToBunny(audioFile, 'audio');
                    }

                    // Parse and merge request body data
                    if (req.body.data) {
                         try {
                              const data = JSON.parse(req.body.data);
                              req.body = { ...data, ...fileUrls };
                         } catch {
                              return next(new AppError(StatusCodes.BAD_REQUEST, 'Invalid JSON format in req.body.data'));
                         }
                    } else {
                         req.body = { ...fileUrls };
                    }

                    next();
               } catch (uploadError) {
                    console.error('Error during file processing:', uploadError);
                    return next(uploadError);
               }
          } else {
               next();
          }
     });
};

// Log FFmpeg availability on startup
if (ffmpegStatic) {
     console.log('✅ FFmpeg static binary is available for video conversion');
     console.log(`FFmpeg path: ${ffmpegStatic}`);
} else {
     console.warn('⚠️ FFmpeg static binary not available. Video conversion will be skipped.');
}

export default fileUploadHandlerbunny;
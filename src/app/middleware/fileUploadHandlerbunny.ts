import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { BunnyStorageHandeler } from '../../helpers/BunnyStorageHandeler';
import { convertVideoToMov } from '../../shared/convertVideoToMov';


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

export default fileUploadHandlerbunny;
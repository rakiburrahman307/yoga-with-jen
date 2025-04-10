// middleware/fileUploadHandler.ts

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../utils/aws'; // Import the configured S3 client
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';

// Define allowed MIME types for various file types
const allowedMimeTypes: Record<string, string[]> = {
  image: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/aac',
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/mpeg',
    'video/avi',
    'video/mkv',
  ],
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
  logo: ['image/png', 'image/jpg', 'image/jpeg'],
  thumbnail: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
  banner: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
  license: ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'],
  driverLicense: ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'],
  insurance: ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'],
  permits: ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'],
  others: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// S3 upload handler function using PutObjectCommand
const uploadToS3 = async (file: Express.Multer.File, folderName: string) => {
  const fileKey = `${folderName}/${Date.now().toString()}-${file.originalname}`;

  const params = {
    Bucket: config.aws.aws_bucket_name,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
  };

  try {
    console.log(`Attempting to upload ${fileKey} to S3...`);
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);
    console.log(`S3 upload succeeded with response:`, result);

    // Add key to file object for later reference
    (file as any).key = fileKey;
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (error: any) {
    console.error('S3 Upload Error Details:', {
      error: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      extendedRequestId: error.$metadata?.extendedRequestId,
    });

    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error uploading file to S3: ${error.message || 'Unknown error'}`,
    );
  }
};

const fileUploadHandler = () => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1024MB file size limit
  }).fields([
    { name: 'image', maxCount: 10 },
    { name: 'video', maxCount: 5 },
    { name: 'audio', maxCount: 5 },
    { name: 'thumbnail', maxCount: 5 },
    { name: 'document', maxCount: 10 },
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'license', maxCount: 2 },
    { name: 'driverLicense', maxCount: 2 },
    { name: 'insurance', maxCount: 2 },
    { name: 'permits', maxCount: 5 },
    { name: 'others', maxCount: 5 },
  ]);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First, use multer to handle the file upload
      upload(req, res, async (multerErr) => {
        if (multerErr) {
          return next(new AppError(StatusCodes.BAD_REQUEST, multerErr.message));
        }

        // Manually check file types after multer has processed them
        if (req.files) {
          for (const [fieldName, files] of Object.entries(req.files)) {
            if (Array.isArray(files)) {
              for (const file of files) {
                // Validate file mimetype
                const allowedTypes =
                  allowedMimeTypes[fieldName as keyof typeof allowedMimeTypes];
                if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
                  return next(
                    new AppError(
                      StatusCodes.BAD_REQUEST,
                      `Invalid file type for ${fieldName}. Only ${allowedTypes?.join(', ') || 'no files'} are allowed.`,
                    ),
                  );
                }
              }
            }
          }
        }

        // If there are files to upload
        if (req.files && Object.keys(req.files).length > 0) {
          try {
            console.log(
              `Starting to upload ${Object.keys(req.files).length} file types to S3...`,
            );

            for (const [fieldName, files] of Object.entries(req.files)) {
              if (Array.isArray(files)) {
                console.log(
                  `Processing ${files.length} files for field: ${fieldName}`,
                );

                // Upload files sequentially to better track errors
                for (const file of files) {
                  try {
                    await uploadToS3(file, fieldName);
                    console.log(
                      `File uploaded successfully: ${(file as any).key}`,
                    );
                  } catch (uploadError: any) {
                    console.error(
                      `Failed to upload file ${file.originalname}:`,
                      uploadError,
                    );
                    return next(uploadError);
                  }
                }
              }
            }

            console.log('All files uploaded successfully');
            next();
          } catch (error: any) {
            console.error('File processing error:', error);
            return next(
              error instanceof AppError
                ? error
                : new AppError(
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    `File upload process failed: ${error.message || 'Unknown error'}`,
                  ),
            );
          }
        } else {
          // No files to upload, just proceed
          next();
        }
      });
    } catch (error: any) {
      console.error('Middleware level error:', error);
      next(
        error instanceof AppError
          ? error
          : new AppError(
              StatusCodes.INTERNAL_SERVER_ERROR,
              `File upload middleware failed: ${error.message || 'Unknown error'}`,
            ),
      );
    }
  };
};

export default fileUploadHandler;

import { StatusCodes } from 'http-status-codes';
import config from '../config';
import AppError from '../errors/AppError';
import s3Client from './aws';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
export const deleteFromS3 = async (fileKey: string) => {
     const params = {
          Bucket: config.aws.aws_bucket_name,
          Key: fileKey,
     };
     try {
          const command = new DeleteObjectCommand(params);
          await s3Client.send(command);
          console.log(`File deleted from S3: ${fileKey}`);
     } catch (error: any) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, `Failed to delete file: ${error.message}`);
     }
};

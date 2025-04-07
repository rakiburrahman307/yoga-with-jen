import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import AppError from '../../errors/AppError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'banner':
          uploadDir = path.join(baseUploadDir, 'banner');
          break;
        case 'logo':
          uploadDir = path.join(baseUploadDir, 'logo');
          break;
        default:
          throw new AppError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    console.log('file handler', file);
    if (
      file.fieldname === 'image' ||
      file.fieldname === 'logo' ||
      file.fieldname === 'banner'
    ) {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'application/octet-stream' ||
        file.mimetype === 'image/svg+xml'
      ) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg .svg .webp .octet-stream .svg+xml file supported',
          ),
        );
      }
    } else {
      cb(new AppError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({ storage: storage, fileFilter: filterFilter }).fields([
    { name: 'image', maxCount: 10 },
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]);
  return upload;
};

export default fileUploadHandler;

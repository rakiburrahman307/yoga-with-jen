import { Request, Response, NextFunction } from 'express';
import { getSingleFilePath } from '../../shared/getFilePath';

const parseFileData = (req: Request, res: Response, next: NextFunction) => {
  try {
    const image = getSingleFilePath(req.files, 'image');
    if (req.body.data) {
      const data = JSON.parse(req.body.data);
      req.body = { image, ...data };
    } else {
      req.body = { image };
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default parseFileData;

import fs from 'fs';
import path from 'path';
import getUploadDirectory from '../utils/getUploadDirectory';

const unlinkFile = (file: string | string[]) => {
     if (typeof file === 'string') {
          const baseUploadDir = getUploadDirectory();
          const filePath = path.join(baseUploadDir, file);
          if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath);
          }
     } else if (Array.isArray(file)) {
          file.forEach((singleFile) => {
                const baseUploadDir = getUploadDirectory();
               const filePath = path.join(baseUploadDir, singleFile);
               if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
               }
          });
     }
};

export default unlinkFile;
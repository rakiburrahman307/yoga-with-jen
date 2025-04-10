export type IFolderName =
  | 'image'
  | 'license'
  | 'driverLicense'
  | 'insurance'
  | 'permits'
  | 'banner'
  | 'logo'
  | 'audio'
  | 'video'
  | 'document'
  | 'thumbnail'
  | 'others';

const getPublicUri = (fileKey: string): string => {
  console.log(fileKey);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

// single file
export const getSingleFilePath = (files: any, folderName: IFolderName) => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return getPublicUri(fileField[0].key);
  }

  return undefined;
};
// multiple files
export const getMultipleFilesPath = (files: any, folderName: IFolderName) => {
  const folderFiles = files && files[folderName];
  if (folderFiles && Array.isArray(folderFiles)) {
    return folderFiles.map((file: any) => getPublicUri(file.key));
  }

  return undefined;
};

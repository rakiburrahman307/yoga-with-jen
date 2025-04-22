import config from "../config";
export const getBunnyUrl = (fileKey: string): string => {
    const url = `${config.bunnyCDN.pullZoneUrl}/${fileKey}`;
    return url;
  };
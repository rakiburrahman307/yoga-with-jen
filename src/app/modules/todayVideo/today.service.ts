import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { decryptUrl } from '../../../utils/cryptoToken';
import config from '../../../config';
import { User } from '../user/user.model';

let activeVideo: any = null;
let activeVideoPickedAt: any = null;

const getTodayRandomVideo = async () => {
     const now = new Date();

     // If no video picked yet or 24 hours have passed
     if (!activeVideo || (now.getTime() - activeVideoPickedAt.getTime()) > 24 * 60 * 60 * 1000) {
          // Pick a new random video from all videos
          const result = await Video.aggregate([{ $sample: { size: 1 } }]);
          activeVideo = result.length > 0 ? result[0] : null;
          activeVideoPickedAt = now;
     }

     return activeVideo;
};

const getSingleVideoFromDb = async (id: string, userId: string) => {
     const result = await Video.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }

     // Decrypt the URL
     const decryptedUrl = decryptUrl(result.videoUrl, config.bunnyCDN.bunny_token as string);

     const hasSubscription = await User.hasActiveSubscription(userId);

     if (hasSubscription) {
          // If the user has an active subscription or the video is free
          const data = {
               ...result.toObject(),
               videoUrl: decryptedUrl,
          };
          return data;
     }

     // If the user doesn't have a subscription and the video is paid
     throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access');
};
export const TodayVideoService = {
     getTodayRandomVideo,
     getSingleVideoFromDb,
};

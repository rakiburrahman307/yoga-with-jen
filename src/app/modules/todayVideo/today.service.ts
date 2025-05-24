import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { decryptUrl } from '../../../utils/cryptoToken';
import config from '../../../config';
import { User } from '../user/user.model';


const getTodayRandomVideo = async () => {
     const today = new Date();
     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
     const endOfDay = new Date(today.setHours(23, 59, 59, 999));

     const result = await Video.aggregate([
          {
               $match: {
                    createdAt: {
                         $gte: startOfDay,
                         $lte: endOfDay,
                    },
               },
          },
          {
               $sample: { size: 1 }, // pick 1 random document
          },
     ]);

     // result will be an array, return the first element or null if empty
     return result.length > 0 ? result[0] : null;
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
     getSingleVideoFromDb
};

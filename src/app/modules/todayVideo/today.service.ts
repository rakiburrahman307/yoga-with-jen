import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { User } from '../user/user.model';
import { Favourite } from '../favourit/favourit.model';
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};
let activeVideo: any = null;
let activeVideoPickedAt: any = null;

const getTodayRandomVideo = async (userId: string) => {
     const now = new Date();
     // If no video picked yet or 24 hours have passed
     if (!activeVideo || now.getTime() - activeVideoPickedAt.getTime() > 24 * 60 * 60 * 1000) {
          // Pick a new random video from all videos
          const result = await Video.aggregate([{ $sample: { size: 1 } }]);
          activeVideo = result.length > 0 ? result[0] : null;
          activeVideoPickedAt = now;
     }
     const isFev = await getFevVideosOrNot(activeVideo._id, userId);
     activeVideo = {
          ...activeVideo,
          isFev,
     };
     return activeVideo;
};

const getSingleVideoFromDb = async (id: string, userId: string) => {
     const result = await Video.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     const hasSubscription = await User.hasActiveSubscription(userId);
     const isFev = await getFevVideosOrNot(id, userId);
     if (hasSubscription) {
          // If the user has an active subscription or the video is free
          const data = {
               ...result.toObject(),
               isFev,
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

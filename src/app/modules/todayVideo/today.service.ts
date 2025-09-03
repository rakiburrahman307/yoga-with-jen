import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { User } from '../user/user.model';
import { Videos } from '../admin/videos/video.model';
import { Favorite } from '../favorite/favorite.model';
import { DailyVideo } from './today.model';

const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favorite.findOne({ videoId, userId });
     return favorite ? true : false;
};

const getTodayRandomVideo = async (userId: string) => {
     const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
     
     // Check if there's already a video selected for today
     let dailyVideo = await DailyVideo.findOne({ date: today }).populate('videoId');
     
     // If no video exists for today, select a new random video
     if (!dailyVideo) {
          // Pick a new random video from all active videos
          const randomVideos = await Videos.aggregate([
               { $match: { status: 'active' } },
               { $sample: { size: 1 } }
          ]);
          
          if (randomVideos.length > 0) {
               const selectedVideo = randomVideos[0];
               
               // Save the selected video for today in database
               dailyVideo = new DailyVideo({
                    date: today,
                    videoId: selectedVideo._id
               });
               await dailyVideo.save();
               
               // Populate the video data
               await dailyVideo.populate('videoId');
          } else {
               throw new AppError(StatusCodes.NOT_FOUND, 'No active videos found');
          }
     }
     
     // Get the video data and add favorite status
     const videoData = dailyVideo.videoId as any;
     const isFev = await getFevVideosOrNot(videoData._id, userId);
     
     return {
          ...videoData,
          isFev,
     };
};

const getSingleVideoFromDb = async (id: string, userId: string) => {
     const result = await Videos.findById(id);
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

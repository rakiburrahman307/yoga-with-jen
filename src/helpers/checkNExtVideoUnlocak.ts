import { ChallengeVideo } from '../app/modules/admin/challenges/challenges.model';
import { Video } from '../app/modules/admin/videosManagement/videoManagement.model';

export const checkNextVideoUnlock = async (userId: string, subCategoryId: string, completedVideoId: string) => {
     try {
          // Get all videos in the subcategory sorted by order
          const allVideos = await Video.find({
               subCategoryId: subCategoryId,
               status: 'active',
          }).sort({ order: 1, serial: 1 });

          // Find current video index
          const currentVideoIndex = allVideos.findIndex((video) => video._id.toString() === completedVideoId.toString());

          if (currentVideoIndex === -1) {
               return { isEnabled: false, reason: 'Current video not found' };
          }
          // Check if there's a next video
          if (currentVideoIndex >= allVideos.length - 1) {
               return {
                    isEnabled: false,
                    reason: 'Last video in sequence',
                    isSequenceComplete: true,
                    totalVideos: allVideos.length,
               };
          }

          const nextVideo = allVideos[currentVideoIndex + 1];

          return {
               isEnabled: true,
               nextVideo: {
                    id: nextVideo._id,
                    name: nextVideo.title,
                    //    order: nextVideo.order,
                    serial: nextVideo.serial,
               },
               currentVideoIndex: currentVideoIndex,
               totalVideos: allVideos.length,
               progress: Math.round(((currentVideoIndex + 1) / allVideos.length) * 100),
          };
     } catch (error) {
          console.error('Error checking next video unlock:', error);
          return { isEnabled: false, reason: 'Error checking unlock status' };
     }
};
export const checkNextVideoUnlockForChallenge = async (userId: string, challengeId: string, completedVideoId: string) => {
     try {
          // Get all videos in the subcategory sorted by order
          const allVideos = await ChallengeVideo.find({
               challengeId: challengeId,
               status: 'active',
          }).sort({ order: 1, serial: 1 });

          // Find current video index
          const currentVideoIndex = allVideos.findIndex((video) => video._id.toString() === completedVideoId.toString());

          if (currentVideoIndex === -1) {
               return { isEnabled: false, reason: 'Current video not found' };
          }

          // Check if there's a next video
          if (currentVideoIndex >= allVideos.length - 1) {
               return {
                    isEnabled: false,
                    reason: 'Last video in sequence',
                    isSequenceComplete: true,
                    totalVideos: allVideos.length,
               };
          }

          const nextVideo = allVideos[currentVideoIndex + 1];

          return {
               isEnabled: true,
               nextVideo: {
                    id: nextVideo._id,
                    name: nextVideo.title,
                    //    order: nextVideo.order,
               },
               currentVideoIndex: currentVideoIndex,
               totalVideos: allVideos.length,
               progress: Math.round(((currentVideoIndex + 1) / allVideos.length) * 100),
          };
     } catch (error) {
          console.error('Error checking next video unlock:', error);
          return { isEnabled: false, reason: 'Error checking unlock status' };
     }
};

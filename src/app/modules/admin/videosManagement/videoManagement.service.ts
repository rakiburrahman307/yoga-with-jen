import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IVideo } from './videoManagement.interface';
import { Video } from './videoManagement.model';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
import { decryptUrl } from '../../../../utils/cryptoToken';
import config from '../../../../config';
import { Category } from '../../category/category.model';
import { User } from '../../user/user.model';

// get videos
const getVideos = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Video.find({}), query);
  const videos = await queryBuilder
    .fields()
    .filter()
    .paginate()
    .search([])
    .sort()
    .modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return {
    videos,
    meta,
  };
};
// upload videos
const addVideo = async (payload: IVideo) => {
  const isExistCategory = await Category.findOne({ name: payload.category });
  if (!isExistCategory) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }
  const data = {
    ...payload,
    type: isExistCategory.categoryType,
  };
  const video = await Video.create(data);
  if (!video) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to added videos');
  }
  return video;
};
// update videos
const updateVideo = async (id: string, payload: Partial<IVideo>) => {
  const isExistVideo = await Video.findById(id);
  if (!isExistVideo) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }
  const decodedUrl = decryptUrl(
    isExistVideo.videoUrl,
    config.bunnyCDN.bunny_token as string,
  );
  if (payload.videoUrl && decodedUrl && isExistVideo.videoUrl) {
    try {
      await BunnyStorageHandeler.deleteFromBunny(decodedUrl);
    } catch (error) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error deleting old video from BunnyCDN',
      );
    }
  }

  if (payload.thumbnailUrl && isExistVideo.thumbnailUrl) {
    try {
      await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
    } catch (error) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error deleting old thumbnail from BunnyCDN',
      );
    }
  }
  const result = await Video.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update video');
  }
  return result;
};

// change video status
const statusChangeVideo = async (id: string, status: string) => {
  const result = await Video.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Failed to change video status',
    );
  }
  return result;
};

// delete video from bunny cdn and mongodb
const removeVideo = async (id: string) => {
  const isExistVideo = await Video.findById(id);
  if (!isExistVideo) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }
  const decodedUrl = decryptUrl(
    isExistVideo.videoUrl,
    config.bunnyCDN.bunny_token as string,
  );
  if (decodedUrl && isExistVideo.videoUrl) {
    try {
      await BunnyStorageHandeler.deleteFromBunny(decodedUrl);

      if (isExistVideo.thumbnailUrl) {
        await BunnyStorageHandeler.deleteFromBunny(isExistVideo.thumbnailUrl);
      }
    } catch (error) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error deleting video from BunnyCDN',
      );
    }
  }

  const result = await Video.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete video');
  }
  return result;
};
const getSingleVideoFromDb = async (id: string, userId: string) => {
  const result = await Video.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }

  // Decrypt the URL
  const decryptedUrl = decryptUrl(
    result.videoUrl,
    config.bunnyCDN.bunny_token as string,
  );

  const hasSubscription = await User.hasActiveSubscription(userId);

  if (
    hasSubscription ||
    result.type === 'free' ||
    (!hasSubscription && result.type === 'free')
  ) {
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
const getSingleVideoForAdmin = async (id: string, userId: string) => {
  const result = await Video.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }

  // Decrypt the URL
  const decryptedUrl = decryptUrl(
    result.videoUrl,
    config.bunnyCDN.bunny_token as string,
  );

  // If the user has an active subscription or the video is free
  const data = {
    ...result.toObject(),
    videoUrl: decryptedUrl,
  };
  return data;
};
// Mark a video as completed for a user
const markVideoAsCompleted = async (userId: string, videoId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (!user.completedSessions.map((id) => id.toString()).includes(videoId)) {
    const updateCompleteSession = await User.findByIdAndUpdate(userId, {
      $push: { completedSessions: videoId },
    });

    if (!updateCompleteSession) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Failed to mark video as completed',
      );
    }
    return true;
  }
};
export const videoManagementService = {
  getVideos,
  addVideo,
  updateVideo,
  statusChangeVideo,
  removeVideo,
  getSingleVideoFromDb,
  markVideoAsCompleted,
  getSingleVideoForAdmin,
};

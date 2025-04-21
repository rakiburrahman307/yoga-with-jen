import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IVideo } from './videoManagement.interface';
import { Video } from './videoManagement.model';
import { BunnyStorageHandeler } from '../../../../helpers/BunnyStorageHandeler';
// get videos
const getVideos = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Video.find({ status: 'active' }),
    query,
  );
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
  const video = await Video.create(payload);
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
  if (payload.videoUrl && isExistVideo.videoUrl) {
    try {
      await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);
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
  if (isExistVideo.videoUrl) {
    try {
      await BunnyStorageHandeler.deleteFromBunny(isExistVideo.videoUrl);

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

export const videoManagementService = {
  getVideos,
  addVideo,
  updateVideo,
  statusChangeVideo,
  removeVideo,
};

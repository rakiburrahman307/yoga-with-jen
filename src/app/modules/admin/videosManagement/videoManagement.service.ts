import QueryBuilder from '../../../builder/QueryBuilder';
import { Video } from './videoManagement.model';

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
const addVideo = async () => {};
const updateVideo = async () => {};
const blockedVideo = async () => {};
const statusChangeVideo = async () => {};
const removeVideo = async () => {};

export const videoManagementService = {
  getVideos,
  addVideo,
  updateVideo,
  blockedVideo,
  statusChangeVideo,
  removeVideo,
};

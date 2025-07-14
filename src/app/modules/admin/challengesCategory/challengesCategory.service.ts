// Importing required dependencies
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { ChallengeCategory } from './challengesCategory.model';
import { IChallengeCategory } from './challengesCategory.interface';
import { ChallengeVideo } from '../challenges/challenges.model';

// category challenges section start here
const createChallengeCategory = async (payload: IChallengeCategory) => {
     const result = await ChallengeCategory.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Challenge');
     }
     return result;
};
const getAllChallengeCategory = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ChallengeCategory.find({}), query);
     const result = await queryBuilder.fields().sort().paginate().filter().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return { result, meta };
};
const getAllChallengeCategoryForUser = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(ChallengeCategory.find({ status: 'active' }), query);
     const result = await queryBuilder.fields().sort().paginate().filter().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return { result, meta };
};

const getSingleChallengeCategory = async (id: string) => {
     const result = await ChallengeCategory.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     return result;
};
const updateChallengeCategory = async (id: string, payload: Partial<IChallengeCategory>) => {
     const result = await ChallengeCategory.findByIdAndUpdate(id, payload, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     return result;
};
const deleteChallengeCategory = async (id: string) => {
     // Find the challenge category first
     const result = await ChallengeCategory.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     // Now delete the category
     const deleteCategoryResult = await ChallengeCategory.findByIdAndDelete(id);
     if (!deleteCategoryResult) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge category could not be deleted');
     }

     // Optionally delete related videos (only if necessary)
     const deleteVideos = await ChallengeVideo.deleteMany({ challengeId: result._id });
     if (deleteVideos.deletedCount === 0) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'No related videos to delete');
     }
     return deleteCategoryResult;
};
const statusUpdate = async (id: string, status: string) => {
     const result = await ChallengeCategory.findByIdAndUpdate(id, { status }, { new: true });
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Challenge not found');
     }
     return result;
};
const shuffleCategorySerial = async (categoryOrder: Array<{ _id: string; serial: number }>) => {
     // Validate input
     if (!categoryOrder || !Array.isArray(categoryOrder) || categoryOrder.length === 0) {
          console.log('No category order data provided.');
          return;
     }

     // Update each video's serial number
     const updatePromises = categoryOrder.map((item) => ChallengeCategory.findByIdAndUpdate(item._id, { serial: item.serial }, { new: true }));

     const result = await Promise.all(updatePromises);
     return result;
};
export const ChallengeService = {
     getSingleChallengeCategory,
     createChallengeCategory,
     getAllChallengeCategory,
     updateChallengeCategory,
     deleteChallengeCategory,
     getAllChallengeCategoryForUser,
     shuffleCategorySerial,
     statusUpdate,
};

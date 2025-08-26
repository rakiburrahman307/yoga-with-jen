import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import { SubCategory } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import { Favorite } from '../favorite/favorite.model';
import { Videos } from '../admin/videos/video.model';
// create sub category
const createSubCategoryToDB = async (payload: ISubCategory) => {
     const { name, thumbnail, categoryId } = payload;
     const isExistCategory = await Category.findById(categoryId);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found!');
     }
     const isSubCategoryExistName = await SubCategory.findOne({ name: name });
     if (isSubCategoryExistName) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This SubCategory Name Already Exists');
     }

     const createSubCategory = await SubCategory.create(payload);
     if (!createSubCategory) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create subcategory');
     }
     await Category.findByIdAndUpdate(
          categoryId,
          {
               $push: { subCategory: createSubCategory._id },
          },
          { new: true },
     );

     return createSubCategory;
};
// get sub category
const getCategoriesFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(SubCategory.find({}), query);
     const subCategories = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          subCategories,
          meta,
     };
};
// update sub category
const updateCategoryToDB = async (id: string, payload: ISubCategory) => {
     const isExistSubCategory: any = await SubCategory.findById(id);

     if (!isExistSubCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     if (payload.thumbnail && isExistSubCategory.thumbnail) {
          unlinkFile(isExistSubCategory?.thumbnail);
     }

     const updateSubCategory = await SubCategory.findByIdAndUpdate(id, payload, {
          new: true,
     });

     return updateSubCategory;
};

const deleteCategoryToDB = async (id: string) => {
     const deleteCategory = await SubCategory.findByIdAndDelete(id);
     if (!deleteCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }
     return deleteCategory;
};
// update sub category status
const updateCategoryStatusToDB = async (id: string, payload: string) => {
     const isExistCategory: any = await SubCategory.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     const updateCategory = await SubCategory.findByIdAndUpdate(
          id,
          {
               $set: { status: payload },
          },
          {
               new: true,
          },
     );

     if (!updateCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update subcategory!');
     }
     return updateCategory;
};
const getCategoryRelatedSubcategory = async (id: string) => {
     const result = await SubCategory.find({ categoryId: id });
     if (!result) {
          return [];
     }
     return result;
};
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favorite.findOne({ videoId, userId });
     return favorite ? true : false;
};
// const getVideoCompleteOrNot = async (videoId: string, userId: string): Promise<boolean> => {
//      const video = await Videos.findById(videoId);
//      if (!video) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
//      }
//      // Find user
//      const user = await User.findById(userId);
//      if (!user) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//      }

//      if (!user.completedSessions || user.completedSessions.length === 0) {
//           return false;
//      }
//      const isVideoCompleted = user.completedSessions.some((sessionId: any) => {
//           const sessionIdString = sessionId.toString();
//           const videoIdString = videoId.toString();
//           return sessionIdString === videoIdString;
//      });

//      return isVideoCompleted;
// };

const getSubCategoryRelatedVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Check if subcategory exists
     const isExistCategory = await SubCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     const queryBuilder = new QueryBuilder(Videos.find({ subCategoryId: isExistCategory._id, status: 'active' }).sort({ order: 1, serial: 1 }), query);

     const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const completedVideoIds = user.completedSessions?.map((id) => id.toString()) || [];

     const postsWithStatus = await Promise.all(
          result.map(async (post: any, index: number) => {
               const videoIdString = post._id.toString();
               const isVideoCompleted = completedVideoIds.includes(videoIdString);

               let isEnabled = false;
               if (index === 0) {
                    isEnabled = true;
               } else {

                    const allPreviousCompleted = result.slice(0, index).every((prevVideo: any) => completedVideoIds.includes(prevVideo._id.toString()));
                    isEnabled = allPreviousCompleted;
               }
               const isFavorite = await getFevVideosOrNot(post._id, userId);

               return {
                    ...post.toObject(),
                    isFavorite,
                    isVideoCompleted,
                    isEnabled,
               };
          }),
     );

     return {
          result: postsWithStatus,
          meta,
     };
};
const getSubCategoryDetails = async (id: string) => {
     const result = await SubCategory.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'SubCategory not found');
     }
     return result;
};
const shuffleVideoSerial = async (videoOrder: Array<{ _id: string; serial: number }>) => {
     // Validate input
     if (!videoOrder || !Array.isArray(videoOrder) || videoOrder.length === 0) {
          return;
     }
     // Update each video's serial number
     const updatePromises = videoOrder.map((item) => Videos.findByIdAndUpdate(item._id, { serial: item.serial }, { new: true }));

     const result = await Promise.all(updatePromises);
     return result;
};

export const CategoryService = {
     createSubCategoryToDB,
     getCategoriesFromDB,
     updateCategoryToDB,
     deleteCategoryToDB,
     updateCategoryStatusToDB,
     getCategoryRelatedSubcategory,
     getSubCategoryRelatedVideo,
     getSubCategoryDetails,
     shuffleVideoSerial,
};

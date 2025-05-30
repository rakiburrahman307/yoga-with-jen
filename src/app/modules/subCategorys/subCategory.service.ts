import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import { SubCategory } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { Category } from '../category/category.model';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { Favourite } from '../favourit/favourit.model';
import { User } from '../user/user.model';
// create sub category
const createSubCategoryToDB = async (payload: ISubCategory) => {
     console.log(payload);
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
     const subCategorys = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          subCategorys,
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
// update catgeory status
const updateCategoryStatusToDB = async (id: string, payload: string) => {
     const isExistCategory: any = await SubCategory.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     const updateCategory = await Category.findByIdAndUpdate(
          id,
          {
               $set: { status: payload },
          },
          {
               new: true,
          },
     );

     if (!updateCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update category!');
     }
     return updateCategory;
};
const getCategoryReletedSubcategory = async (id: string) => {
     const result = await SubCategory.find({ categoryId: id });
     if (!result) {
          return [];
     }
     return result;
};
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};
const getVideoCompleteOrNot = async (videoId: string, userId: string): Promise<boolean> => {
     // Find video
     const video = await Video.findById(videoId);
     if (!video) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
     }
     // Find user
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     // Check if completedSessions exists and has items
     if (!user.completedSessions || user.completedSessions.length === 0) {
          return false;
     }

     // Method 1: If completedSessions stores videoIds directly (most likely based on your markVideoAsCompleted function)
     const isVideoCompleted = user.completedSessions.some((sessionId: any) => {
          const sessionIdString = sessionId.toString();
          const videoIdString = videoId.toString();
          return sessionIdString === videoIdString;
     });

     return isVideoCompleted;
};

const getSubCategoryRelatedVideo = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Check if subcategory exists
     const isExistCategory = await SubCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     // Get videos sorted by order (add 'order' field to your Video schema)
     const queryBuilder = new QueryBuilder(Video.find({ subCategoryId: isExistCategory._id, status: 'active' }).sort({ order: 1, serial: 1 }), query);

     const result = await queryBuilder.fields().filter().paginate().search(['name']).modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     // Get user data once (more efficient)
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }

     const completedVideoIds = user.completedSessions?.map((id) => id.toString()) || [];

     // Process videos with sequential logic
     const postsWithStatus = await Promise.all(
          result.map(async (post: any, index: number) => {
               const videoIdString = post._id.toString();

               // Check if current video is completed
               const isVideoCompleted = completedVideoIds.includes(videoIdString);

               // Check if video is enabled (sequential logic)
               let isEnabled = false;
               if (index === 0) {
                    // First video is always enabled
                    isEnabled = true;
               } else {
                    // Check if ALL previous videos are completed (strict sequential)
                    const allPreviousCompleted = result.slice(0, index).every((prevVideo: any) => completedVideoIds.includes(prevVideo._id.toString()));
                    isEnabled = allPreviousCompleted;
               }

               // Get favorite status
               const isFavorite = await getFevVideosOrNot(post._id, userId);

               return {
                    ...post.toObject(),
                    isFavorite,
                    isVideoCompleted,
                    isEnabled, // This is the key property for sequential access
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
export const CategoryService = {
     createSubCategoryToDB,
     getCategoriesFromDB,
     updateCategoryToDB,
     deleteCategoryToDB,
     updateCategoryStatusToDB,
     getCategoryReletedSubcategory,
     getSubCategoryRelatedVideo,
     getSubCategoryDetails,
};

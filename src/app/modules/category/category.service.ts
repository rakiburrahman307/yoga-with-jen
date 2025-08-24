import { StatusCodes } from 'http-status-codes';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SubCategory } from '../subCategorys/subCategory.model';
import { USER_ROLES } from '../../../enums/user';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { Favourite } from '../favorite/favorite.model';

const createCategoryToDB = async (payload: ICategory) => {
     const { name, thumbnail } = payload;
     const isExistName = await Category.findOne({ name });

     if (isExistName) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This Category Name Already Exists');
     }
     const newCategory = new Category({
          name,
          // categoryType,
          thumbnail,
     });

     const createdCategory = await newCategory.save();

     if (!createdCategory) {
          unlinkFile(thumbnail);
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create Category');
     }

     return createdCategory;
};
// get c  ategorys
const getCategoriesFromDB = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(Category.find().sort({ serial: 1 }), query);
     const categorys = await queryBuilder
          .fields()
          .filter()
          .paginate()
          .search(['name'])
          .sort()
          .modelQuery.populate({
               path: 'subCategory',
               select: {
                    name: 1,
               },
          })
          .exec();
     const meta = await queryBuilder.countTotal();
     return {
          categorys,
          meta,
     };
};
// update catgeory
const updateCategoryToDB = async (id: string, payload: ICategory) => {
     const isExistCategory: any = await Category.findById(id);

     if (!isExistCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }

     if (payload.thumbnail && isExistCategory?.thumbnail) {
          unlinkFile(isExistCategory?.thumbnail);
     }

     const updateCategory = await Category.findByIdAndUpdate(id, payload, {
          new: true,
     });

     if (!updateCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Faield to update category!');
     }
     return updateCategory;
};
// update catgeory status
const updateCategoryStatusToDB = async (id: string, payload: string) => {
     const isExistCategory: any = await Category.findById(id);

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

// delete category
const deleteCategoryToDB = async (id: string) => {
     const deleteCategory = await Category.findByIdAndUpdate(id, {
          $set: { isDeleted: true },
     });
     if (!deleteCategory) {
          throw new AppError(StatusCodes.BAD_REQUEST, "Category doesn't exist");
     }
     return deleteCategory;
};
const getSingleCategoryFromDB = async (id: string, userId: string) => {
     const result = await Category.findById(id).populate('subCategory');
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     const isExist = await User.findById(userId);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
     }
     if ((await User.hasActiveSubscription(userId)) || isExist?.role === USER_ROLES.SUPER_ADMIN) {
          return result;
     }
     throw new AppError(StatusCodes.FORBIDDEN, 'You have to subscribe to access this category');
};
const getSubcategoryWithCategoryIdFromDB = async (id: string, query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(SubCategory.find({ categoryId: id }), query);
     const result = await queryBuilder
          .fields()
          .filter()
          .paginate()
          .search(['name'])
          .sort()
          .modelQuery.populate({
               path: 'categoryId',
               select: {
                    name: 1,
               },
          })
          .exec();
     const meta = await queryBuilder.countTotal();
     return {
          result,
          meta,
     };
};
const getFevVideosOrNot = async (videoId: string, userId: string) => {
     const favorite = await Favourite.findOne({ videoId, userId });
     return favorite ? true : false;
};
const getCategoryRelatedSubCategory = async (id: string, userId: string, query: Record<string, unknown>) => {
     const isExistCategory = await Category.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     const queryBuilder = new QueryBuilder(Video.find({ categoryId: isExistCategory._id, subCategoryId: '', status: 'active' }), query);
     const result = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     const postsWithFavorites = await Promise.all(
          result.map(async (post: any) => {
               const isFevorite = await getFevVideosOrNot(post._id, userId);
               return {
                    ...post.toObject(),
                    isFevorite,
               };
          }),
     );
     return {
          result: postsWithFavorites,
          meta,
     };
};
const getCategoriesAllVideos = async (id: string, userId: string, query: Record<string, unknown>) => {
     // Find category and populate subcategories
     const isExistCategory = await Category.findById(id).populate('subCategory');
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }

     // Get subcategory IDs for filtering
     const subCategoryIds = isExistCategory.subCategory.map((sub: any) => sub._id);

     // Get videos for this category (both direct category videos and subcategory videos)
     const queryBuilder = new QueryBuilder(
          Video.find({
               categoryId: isExistCategory._id,
               $or: [
                    { subCategoryId: '' }, // Direct category videos
                    { subCategoryId: { $in: subCategoryIds } }, // Subcategory videos
               ],
          }),
          query,
     );

     const result = await queryBuilder.fields().filter().paginate().search(['name']).sort().modelQuery.exec();

     const meta = await queryBuilder.countTotal();

     // Add favorite status to videos
     const videosWithFavorites = await Promise.all(
          result.map(async (video: any) => {
               const isFevorite = await getFevVideosOrNot(video._id, userId);
               return {
                    ...video.toObject(),
                    isFevorite,
               };
          }),
     );

     return {
          videos: videosWithFavorites,
          meta,
     };
};

const shuffleCategorySerial = async (categoryOrder: Array<{ _id: string; serial: number }>) => {
     // Validate input
     if (!categoryOrder || !Array.isArray(categoryOrder) || categoryOrder.length === 0) {
          console.log('No category order data provided.');
          return;
     }

     // Update each video's serial number
     const updatePromises = categoryOrder.map((item) => Category.findByIdAndUpdate(item._id, { serial: item.serial }, { new: true }));

     const result = await Promise.all(updatePromises);
     return result;
};
export const CategoryService = {
     createCategoryToDB,
     getCategoriesFromDB,
     updateCategoryToDB,
     deleteCategoryToDB,
     updateCategoryStatusToDB,
     getSingleCategoryFromDB,
     getSubcategoryWithCategoryIdFromDB,
     getCategoryRelatedSubCategory,
     getCategoriesAllVideos,
     shuffleCategorySerial,
};

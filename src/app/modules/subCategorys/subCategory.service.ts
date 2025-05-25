import { StatusCodes } from 'http-status-codes';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import { SubCategory } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { Category } from '../category/category.model';
import { Video } from '../admin/videosManagement/videoManagement.model';
import { Favourite } from '../favourit/favourit.model';
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
const getSubCategoryRelatedVideo = async (id: string,userId:string, query: Record<string, unknown>) => {
     const isExistCategory = await SubCategory.findById(id);
     if (!isExistCategory) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
     }
     const queryBuilder = new QueryBuilder(Video.find({ subCategoryId: isExistCategory._id }), query);
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
export const CategoryService = {
     createSubCategoryToDB,
     getCategoriesFromDB,
     updateCategoryToDB,
     deleteCategoryToDB,
     updateCategoryStatusToDB,
     getCategoryReletedSubcategory,
     getSubCategoryRelatedVideo
};

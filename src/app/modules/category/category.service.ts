import { StatusCodes } from 'http-status-codes';
import { ICategory } from './category.interface';
import { Category } from './category.model';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { SubCategory } from '../subCategorys/subCategory.model';

const createCategoryToDB = async (payload: ICategory) => {
  const { name, categoryType, thumbnail } = payload;
  const isExistName = await Category.findOne({ name });

  if (isExistName) {
    unlinkFile(thumbnail);
    throw new AppError(
      StatusCodes.NOT_ACCEPTABLE,
      'This Category Name Already Exists',
    );
  }
  const newCategory = new Category({
    name,
    thumbnail,
    categoryType,
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
  const queryBuilder = new QueryBuilder(Category.find({}), query);
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
  const deleteCategory = await Category.findByIdAndDelete(id);
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
  if (
    (await User.hasActiveSubscription(userId)) ||
    result?.categoryType === 'free'
  ) {
    return result;
  }
  throw new AppError(
    StatusCodes.FORBIDDEN,
    'You have to subscribe to access this category',
  );
};
const getSubcategoryWithCategoryIdFromDB = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    SubCategory.find({ categoryId: id }),
    query,
  );
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
export const CategoryService = {
  createCategoryToDB,
  getCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB,
  updateCategoryStatusToDB,
  getSingleCategoryFromDB,
  getSubcategoryWithCategoryIdFromDB,
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';
// create categorys
const createCategory = catchAsync(async (req, res) => {
     const categoryData = req.body;
     const result = await CategoryService.createCategoryToDB(categoryData);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category create successfully',
          data: result,
     });
});
// get all categorys
const getCategories = catchAsync(async (req, res) => {
     const result = await CategoryService.getCategoriesFromDB(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category retrieved successfully',
          data: result.categorys,
          pagination: result.meta,
     });
});
// update categorys
const updateCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const updateCategoryData = req.body;

     const result = await CategoryService.updateCategoryToDB(id, updateCategoryData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category updated successfully',
          data: result,
     });
});
// update category status
const updateCategoryStatus = catchAsync(async (req, res) => {
     const id = req.params.id;
     const { status } = req.body;

     const result = await CategoryService.updateCategoryStatusToDB(id, status);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category status updated successfully',
          data: result,
     });
});
// delete category
const deleteCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const result = await CategoryService.deleteCategoryToDB(id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category delete successfully',
     });
});
const getSingleCategory = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await CategoryService.getSingleCategoryFromDB(req.params.id, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Category retrieved successfully',
          data: result,
     });
});
const getSubcategorisByCategoris = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await CategoryService.getSubcategoryWithCategoryIdFromDB(id, req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Subcategories retrieved successfully',
          data: result,
     });
});
const getVideosByCategory = catchAsync(async (req, res) => {
     const { id } = req.params;
     const { id: userId }: any = req.user;
     const result = await CategoryService.getCategoryRelatedSubCategory(id, userId, req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos retrieved successfully',
          data: result,
     });
});
export const CategoryController = {
     createCategory,
     getCategories,
     updateCategory,
     deleteCategory,
     updateCategoryStatus,
     getSingleCategory,
     getSubcategorisByCategoris,
     getVideosByCategory,
};

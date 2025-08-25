import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './subCategory.service';

const createSubCategory = catchAsync(async (req, res) => {
     const serviceData = req.body;
     const result = await CategoryService.createSubCategoryToDB(serviceData);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category created successfully',
          data: result,
     });
});
// get sub category
const getSubCategories = catchAsync(async (req, res) => {
     const result = await CategoryService.getCategoriesFromDB(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrieved successfully',
          data: result.subCategories,
          pagination: result.meta,
     });
});
const getSubcategoryById = catchAsync(async (req, res) => {
     const result = await CategoryService.getSubCategoryDetails(req.params.id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrieved successfully',
          data: result,
     });
});

const updateSubCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const updateCategoryData = req.body;

     const result = await CategoryService.updateCategoryToDB(id, updateCategoryData);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category updated successfully',
          data: result,
     });
});

const deleteSubCategory = catchAsync(async (req, res) => {
     const id = req.params.id;
     const result = await CategoryService.deleteCategoryToDB(id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category delete successfully',
          data: result,
     });
});
const getCategoryRelatedSubCategory = catchAsync(async (req, res) => {
     const result = await CategoryService.getCategoryRelatedSubcategory(req.params.id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Sub category retrieved successfully',
          data: result,
     });
});
const getVideosBySubCategory = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await CategoryService.getSubCategoryRelatedVideo(req.params.id, id, req.query);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos by sub category retrieved successfully',
          data: result,
     });
});
const safhaleVideoSerial = catchAsync(async (req, res) => {
     const result = await CategoryService.safhaleVideoSerial(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Videos serial update successfully',
          data: result,
     });
});
export const CategoryController = {
     createSubCategory,
     getSubCategories,
     updateSubCategory,
     deleteSubCategory,
     getCategoryRelatedSubCategory,
     getVideosBySubCategory,
     getSubcategoryById,
     safhaleVideoSerial,
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync'; 
import sendResponse from '../../../../shared/sendResponse';
import { ComingSoonService } from './comingSoon.service';


const createComingSoon = catchAsync(async (req, res) => {
  
     const result = await ComingSoonService.createComingSoon(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Coming Soon created successfully',
          data: result,
     });
});


const getAllComingSoon = catchAsync(async (req, res) => {
     const result = await ComingSoonService.getAllComingSoon(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});

const getComingSoonContentLatest = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await ComingSoonService.getComingSoonLatest(id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result[0],
     });
});

const singleComingSoonLatest = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await ComingSoonService.getComingSoonContentLatest(req.params.id, id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result,
     });
});


const singleComingSoon = catchAsync(async (req, res) => {
     const result = await ComingSoonService.getSingleComingSoon(req.params.id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon retrieved successfully',
          data: result,
     });
});

const updateComingSoon = catchAsync(async (req, res) => {
     const result = await ComingSoonService.updateComingSoon(req.params.id, req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon updated successfully',
          data: result,
     });
});

const deleteComingSoon = catchAsync(async (req, res) => {

     const result = await ComingSoonService.deleteComingSoon(req.params.id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon deleted successfully',
          data: result,
     });
});

const updateIsReady = catchAsync(async (req, res) => {
     const result = await ComingSoonService.updateIsReady(req.params.id, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Coming Soon is ready successfully',
          data: result,
     });
});

export const ComingSoonController = {
     createComingSoon,
     getAllComingSoon,
     getComingSoonContentLatest,
     singleComingSoonLatest,
     singleComingSoon,
     updateComingSoon,
     deleteComingSoon,
     updateIsReady
};

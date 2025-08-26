import { StatusCodes } from 'http-status-codes'; // Standard HTTP status codes for response
import catchAsync from '../../../../shared/catchAsync'; // Error handling utility for async functions
import sendResponse from '../../../../shared/sendResponse'; // Utility to format and send the response
import { ChallengeService } from './challenges.service';

// Controller function to create a new "Create Challenge" entry
const createChallengeVideos = catchAsync(async (req, res) => {
     const result = await ChallengeService.createChallenge(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Challenge created successfully',
          data: result,
     });
});
const createChallengeForSchedule = catchAsync(async (req, res) => {
     const { videoIds, challengeCategoryId, publishAt } = req.body;
     const result = await ChallengeService.copyChallengeVideo(videoIds, challengeCategoryId, publishAt);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Post created successfully',
          data: result,
     });
});

// Controller function to get all "Create Challenge" entries, with pagination
const getAllCreateChallenge = catchAsync(async (req, res) => {
     const result = await ChallengeService.getAllChallenge(req.params.id, req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result.result,
          pagination: result.meta,
     });
});
const getChallenges = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await ChallengeService.getChallengeRelateVideo(req.params.id, id, req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result,
     });
});

// Controller function to fetch a specific "Create Challenge" entry by ID
const singleChallenge = catchAsync(async (req, res) => {
     // Fetching a specific "Create Challenge" entry by ID
     const result = await ChallengeService.getSingleChallenge(req.params.id);

     // Sending the response with the result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result,
     });
});

// Controller function to update a "Create Challenge" entry
const updateChallenge = catchAsync(async (req, res) => {
     // Updating the "Create Challenge" entry by ID with the data from the request body
     const result = await ChallengeService.updateChallenge(req.params.id, req.body);

     // Sending the response with the updated result
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge updated successfully',
          data: result,
     });
});

// Controller function to delete a "Create Challenge" entry by ID
const deleteChallenge = catchAsync(async (req, res) => {
     // Deleting the "Create Challenge" entry by ID
     const result = await ChallengeService.deleteChallenge(req.params.id);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge deleted successfully',
          data: result,
     });
});
const getChallenge = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await ChallengeService.getChallengeRelateVideo(req.params.id, id, req.query);

     // Sending the response after successful deletion
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Challenge retrieved successfully',
          data: result,
     });
});
const markVideoAsCompleted = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { videoId } = req.params;
     const result = await ChallengeService.markVideoAsCompleted(id, videoId);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video mark as complete successfully',
          data: result,
     });
});
const shuffleVideoSerial = catchAsync(async (req, res) => {
     const result = await ChallengeService.shuffleVideoSerial(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Video serial shuffled successfully',
          data: result,
     });
});
export const ChallengeController = {
     createChallengeVideos,
     getAllCreateChallenge,
     singleChallenge,
     updateChallenge,
     deleteChallenge,
     getChallenge,
     createChallengeForSchedule,
     getChallenges,
     markVideoAsCompleted,
     shuffleVideoSerial
};

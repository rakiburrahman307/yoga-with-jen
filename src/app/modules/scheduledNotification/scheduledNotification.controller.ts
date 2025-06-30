import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ScheduledNotificationService } from "./scheduledNotification.service";


// send admin notifications to the users accaunts
const sendAdminNotification = catchAsync(async (req, res) => {
     const result = await ScheduledNotificationService.adminSendNotificationFromDB(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Send Successfully',
          data: result,
     });
});
const getPushNotification = catchAsync(async (req, res) => {
     const result = await ScheduledNotificationService.getAllPushNotification(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Send Successfully',
          data: result.result,
          pagination: result.meta,
     });
});
export const NotificationController = {
     sendAdminNotification,
     getPushNotification,
};

import catchAsync from '../../../shared/catchAsync';
import { SubscriptionService } from './subscription.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const subscriptions = catchAsync(async (req, res) => {
  const result = await SubscriptionService.subscriptionsFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription List Retrieved Successfully',
    data: result,
  });
});

const subscriptionDetails = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await SubscriptionService.subscriptionDetailsFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription Details Retrieved Successfully',
    data: result.subscription,
  });
});

const companySubscriptionDetails = catchAsync(async (req, res) => {
  const result = await SubscriptionService.companySubscriptionDetailsFromDB(
    req.params.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Company Subscription Details Retrieved Successfully',
    data: result.subscription,
  });
});

export const SubscriptionController = {
  subscriptions,
  subscriptionDetails,
  companySubscriptionDetails,
};

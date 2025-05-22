import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { subscriptionRuleService } from './subscriptionRule.service';

const addSubscriptionRule = catchAsync(async (req, res) => {
     const result = await subscriptionRuleService.addRule(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Subscription rule added successfully',
          data: result,
     });
});
const getSubscriptionRule = catchAsync(async (req, res) => {
     const result = await subscriptionRuleService.getRules(req.query);
     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Subscription rule retrived successfully',
          data: result.rules,
          pagination: result.meta,
     });
});
const updateSubscriptionRule = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await subscriptionRuleService.updateRule(id, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription rule updated successfully',
          data: result,
     });
});
const deleteSubscriptionRule = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await subscriptionRuleService.deleteRule(id);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Subscription rule deleted successfully',
          data: result,
     });
});

export const subscriptionRuleController = {
     addSubscriptionRule,
     updateSubscriptionRule,
     deleteSubscriptionRule,
     getSubscriptionRule,
};

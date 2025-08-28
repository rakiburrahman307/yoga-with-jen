import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { checkUserTrialStatus } from '../../helpers/subscription/checkTrialStatus';
import { User } from '../modules/user/user.model';

/**
 * Middleware to check if user has valid subscription access
 * This includes both active subscriptions and valid trial periods
 */
const checkSubscriptionAccess = async (req: Request, res: Response, next: NextFunction) => {
     try {
          const userId = (req as any).user?.id;
          
          if (!userId) {
               throw new AppError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
          }

          // Get user details
          const user = await User.findById(userId);
          if (!user) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
          }

          // Check trial status
          const trialStatus = await checkUserTrialStatus(userId);
          
          // User has access if:
          // 1. They have an active subscription, OR
          // 2. They are in a valid trial period
          const hasAccess = user.hasAccess && (trialStatus.hasActiveSubscription || trialStatus.isInTrial);
          
          if (!hasAccess) {
               // Provide specific error messages based on the situation
               if (user.isFreeTrial && trialStatus.trialEndsAt && new Date() > trialStatus.trialEndsAt) {
                    throw new AppError(
                         StatusCodes.PAYMENT_REQUIRED, 
                         'Your free trial has expired. Please subscribe to continue accessing premium content.'
                    );
               } else if (!user.isSubscribed && !user.isFreeTrial) {
                    throw new AppError(
                         StatusCodes.PAYMENT_REQUIRED, 
                         'You need an active subscription to access this content. Please subscribe to continue.'
                    );
               } else {
                    throw new AppError(
                         StatusCodes.PAYMENT_REQUIRED, 
                         'You do not have access to this content. Please check your subscription status.'
                    );
               }
          }

          // Add trial status to request for use in controllers if needed
          (req as any).trialStatus = trialStatus;
          (req as any).userAccess = {
               hasAccess,
               isSubscribed: user.isSubscribed,
               isFreeTrial: user.isFreeTrial,
               packageName: user.packageName
          };

          next();
     } catch (error) {
          next(error);
     }
};

export default checkSubscriptionAccess;
import { User } from '../../app/modules/user/user.model';
import { Subscription } from '../../app/modules/subscription/subscription.model';

export interface TrialStatus {
     isInTrial: boolean;
     trialEndsAt: Date | null;
     daysRemaining: number;
     hasActiveSubscription: boolean;
}

export const checkUserTrialStatus = async (userId: string): Promise<TrialStatus> => {
     const user = await User.findById(userId);
     const activeSubscription = await Subscription.findOne({
          userId,
          status: { $in: ['active', 'trialing'] }
     });

     if (!user) {
          return {
               isInTrial: false,
               trialEndsAt: null,
               daysRemaining: 0,
               hasActiveSubscription: false
          };
     }

     const now = new Date();
     const isInTrial = user.isFreeTrial && user.trialExpireAt && user.trialExpireAt > now;
     const daysRemaining = isInTrial && user.trialExpireAt 
          ? Math.ceil((user.trialExpireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

     return {
          isInTrial: Boolean(isInTrial),
          trialEndsAt: user.trialExpireAt,
          daysRemaining,
          hasActiveSubscription: Boolean(activeSubscription)
     };
};

export const isTrialExpired = (user: any): boolean => {
     if (!user.isFreeTrial || !user.trialExpireAt) {
          return false;
     }
     return new Date() > user.trialExpireAt;
};

export const getTrialDaysRemaining = (user: any): number => {
     if (!user.isFreeTrial || !user.trialExpireAt) {
          return 0;
     }
     const now = new Date();
     const daysRemaining = Math.ceil((user.trialExpireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
     return Math.max(0, daysRemaining);
};
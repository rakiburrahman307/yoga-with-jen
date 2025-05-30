import { Model, Schema } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
export type IUser = {
     name: string;
     role: USER_ROLES;
     email: string;
     password: string;
     image?: string;
     phone?: string;
     joinDate: Date;
     subscriptionTitle: string;
     trialExpireAt: Date;
     matTime: string;
     subscription: Schema.Types.ObjectId;
     completedSessions: Schema.Types.ObjectId[];
     packageName: string;
     earlyWarningEmailSent: boolean;
     isFreeTrial: boolean;
     isDeleted: boolean;
     isSubscribed: boolean;
     hasAccess: boolean;
     address: string;
     lastLogin: Date;
     tokenVersion : number;
     loginCount: number;
     stripeCustomerId: string;
     status: 'active' | 'blocked';
     verified: boolean;
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode: number;
          expireAt: Date;
     };
};

export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isExistUserByPhone(contact: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
     isInFreeTrial(userId: string): Promise<boolean>;
     hasActiveSubscription(userId: string): Promise<boolean>;
     hasTrialExpired(userId: string): Promise<boolean>;
} & Model<IUser>;

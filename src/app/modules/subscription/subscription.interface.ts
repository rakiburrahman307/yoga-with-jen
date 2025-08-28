import { Model, Types } from 'mongoose';

export type ISubscription = {
     customerId: string;
     price: number;
     userId: Types.ObjectId;
     package: Types.ObjectId;
     trxId: string;
     remaining: number;
     subscriptionId: string;
     status: 'expired' | 'active' | 'cancel' | 'trialing' | 'past_due' | 'unpaid' | 'incomplete';
     currentPeriodStart: string;
     currentPeriodEnd: string;
     trialStart?: string;
     trialEnd?: string;
     cancelAtPeriodEnd?: boolean;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;

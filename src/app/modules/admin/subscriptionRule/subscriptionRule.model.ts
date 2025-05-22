import mongoose, { Schema } from 'mongoose';
import { ISubscriptionRule } from './subscriptionRule.interface';

const subscriptionRuleSchema = new Schema<ISubscriptionRule>({
     rule: {
          type: String,
          required: true,
     },
     subscriptionType: {
          type: String,
          enum: ['app', 'web'],
          required: true,
     },
});

export const SubscriptionRule = mongoose.model<ISubscriptionRule>('SubscriptionRule', subscriptionRuleSchema);

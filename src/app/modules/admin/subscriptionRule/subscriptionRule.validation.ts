import { z } from 'zod';

const subscriptionRuleSchema = z.object({
     body: z.object({
          rule: z.string().min(1, 'Title is required'),
          subscriptionType: z.enum(['app', 'web'], {
               message: 'subscriptionType must be either app or web',
          }),
     }),
});

const updateSubscriptionRuleSchema = z.object({
     body: z.object({
          rule: z.string().min(1, 'Title is required').optional(),
          subscriptionType: z
               .enum(['app', 'web'], {
                    message: 'subscriptionType must be either app or web',
               })
               .optional(),
     }),
});

export const SubscriptionRuleValidation = {
     subscriptionRuleSchema,
     updateSubscriptionRuleSchema,
};

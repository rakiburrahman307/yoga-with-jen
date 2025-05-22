import { getStatusCode, StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { ISubscriptionRule } from './subscriptionRule.interface';
import { SubscriptionRule } from './subscriptionRule.model';
import QueryBuilder from '../../../builder/QueryBuilder';

const addRule = async (rule: ISubscriptionRule) => {
     const result = await SubscriptionRule.create(rule);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create subscription rule');
     }
     return result;
};
const getRules = async (query: Record<string, unknown>) => {
     const builderQuery = new QueryBuilder(SubscriptionRule.find({}), query);
     const rules = await builderQuery.filter().sort().paginate().fields().sort().modelQuery.exec();
     const meta = await builderQuery.countTotal();

     return { rules, meta };
};
const updateRule = async (id: string, rule: Partial<ISubscriptionRule>) => {
     const isExists = await SubscriptionRule.findById(id);
     if (!isExists) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Rule not found');
     }

     const result = await SubscriptionRule.findByIdAndUpdate(id, rule, {
          new: true,
     });
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to update rule');
     }
     return result;
};
const deleteRule = async (id: string) => {
     const result = await SubscriptionRule.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete rule');
     }
     return result;
};

export const subscriptionRuleService = {
     addRule,
     getRules,
     updateRule,
     deleteRule,
};

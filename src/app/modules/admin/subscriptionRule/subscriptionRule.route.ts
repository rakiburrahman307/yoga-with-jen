import express from 'express';
import validateRequest from '../../../middleware/validateRequest';
import { SubscriptionRuleValidation } from './subscriptionRule.validation';
import { subscriptionRuleController } from './subscriptionRule.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = express.Router();
router.post('/create', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(SubscriptionRuleValidation.subscriptionRuleSchema), subscriptionRuleController.addSubscriptionRule);
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), subscriptionRuleController.getSubscriptionRule);
router.get('/rules', auth(USER_ROLES.USER), subscriptionRuleController.getSubscriptionRule);
router.put('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(SubscriptionRuleValidation.updateSubscriptionRuleSchema), subscriptionRuleController.updateSubscriptionRule);
router.delete('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), subscriptionRuleController.deleteSubscriptionRule);

export const SubscriptionRuleRoute = router;

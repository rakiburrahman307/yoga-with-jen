import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

router.get('/revenue', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getRevenue);
router.get('/statistics', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getStatistics);
router.get('/resent-users', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getResentUsers);

export const DashboardRoutes = router;

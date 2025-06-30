import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './scheduledNotification.controller';
import auth from '../../middleware/auth';
const router = express.Router();

router.post('/send', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), NotificationController.sendAdminNotification);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), NotificationController.getPushNotification);

export const ScheduledNotificationRoute = router;

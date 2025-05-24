import express from 'express';
import { TodayVideoController } from './today.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.get('', auth(USER_ROLES.USER), TodayVideoController.getTodayVideo);
router.get('/:id', auth(USER_ROLES.USER), TodayVideoController.getSingleTodayVideo);
export const TodayVideoRoutes = router;

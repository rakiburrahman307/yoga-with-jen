import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { ExploreController } from './explore.controller';

const router = express.Router();
router.get('/letest-class', auth(USER_ROLES.USER), ExploreController.letestVideos);
router.get('/', auth(USER_ROLES.USER), ExploreController.getAllCategories);
export const ExploreRoutes = router;

import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { ExploreController } from './explore.controller';

const router = express.Router();
router.get('/', auth(USER_ROLES.USER), ExploreController.getAllCategories);
export const ExploreRoutes = router;

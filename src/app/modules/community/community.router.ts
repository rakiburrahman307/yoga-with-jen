import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { CommunityController } from './community.controller';
const router = express.Router();
// Define routes
router.post('/', auth(USER_ROLES.USER), CommunityController.createPost);
router.get('/:id', auth(USER_ROLES.USER), CommunityController.getPost);

export const CommunityRouter = router;

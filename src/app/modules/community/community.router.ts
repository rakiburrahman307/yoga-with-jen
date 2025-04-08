import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { CommunityController } from './community.controller';
const router = express.Router();
// Define routes
router.post('/', auth(USER_ROLES.USER), CommunityController.createPost);
router.get('/', auth(USER_ROLES.USER), CommunityController.getAllPost);
router.get('/:id', auth(USER_ROLES.USER), CommunityController.getPost);
router.patch('/:id', auth(USER_ROLES.USER), CommunityController.editPost);
router.delete('/:id', auth(USER_ROLES.USER), CommunityController.deletePost);
router.post(
  '/like/:postId',
  auth(USER_ROLES.USER),
  CommunityController.likedPost,
);
export const CommunityRouter = router;

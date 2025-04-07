import express from 'express';
import { CommentsController } from './comments.controller';
import validateRequest from '../../middleware/validateRequest';
import { CommentsValidationSchema } from './comments.validation';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

// Define routes
router.post(
  '/',
  auth(USER_ROLES.USER),
  validateRequest(CommentsValidationSchema.createCommentsSchema),
  CommentsController.createComment,
);
router.get(
  '/:postId',
  auth(USER_ROLES.USER),
  CommentsController.getComments,
);
router.post(
  '/like/:commentId',
  auth(USER_ROLES.USER),
  CommentsController.likeComment,
);
router.post(
  '/reply/:commentId',
  auth(USER_ROLES.USER),
  CommentsController.replyToComment,
);

export const CommentRouter = router;

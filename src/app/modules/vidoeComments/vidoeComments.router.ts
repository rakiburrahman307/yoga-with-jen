import express from 'express';
import { CommentsController } from './vidoeComments.controller';
import validateRequest from '../../middleware/validateRequest';
import { CommentsValidationSchema } from './vidoeComments.validation';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

// Define routes
router.post('/create', auth(USER_ROLES.USER), validateRequest(CommentsValidationSchema.createCommentsSchema), CommentsController.createComment);
router.get('/:videoId', auth(USER_ROLES.USER), CommentsController.getComments);
router.post('/like/:commentId', auth(USER_ROLES.USER), CommentsController.likeComment);
router.post('/reply/:commentId', auth(USER_ROLES.USER), validateRequest(CommentsValidationSchema.createCommentsSchema), CommentsController.replyToComment);
router.patch('/edit/:commentId', auth(USER_ROLES.USER), validateRequest(CommentsValidationSchema.createCommentsSchema), CommentsController.editComment);
router.delete('/delete/:commentId', auth(USER_ROLES.USER), CommentsController.deleteComment);

export const VideoCommentRouter = router;

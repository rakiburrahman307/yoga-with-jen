import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { videoManagementController } from './videoManagement.controller';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';
import validateRequest from '../../../middleware/validateRequest';
import { VideoVelidationSchema } from './videoManagement.validation';

const router = express.Router();
router.get('/videos', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.getAllVideos);
router.get('/videos/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.getSingleVideoForAdmin);
router.get('/:id', auth(USER_ROLES.USER), videoManagementController.getSingleVideo);
router.post('/upload-video', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(VideoVelidationSchema.videoValidation), videoManagementController.addVideos);
router.put('/update-video/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, videoManagementController.updateVideos);
router.put('/video-status/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(VideoVelidationSchema.videoStatusValidation), videoManagementController.statusChange);
router.delete('/video-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.removeVideos);
router.post('/mark-video-watched/:videoId', auth(USER_ROLES.USER), videoManagementController.markVideoAsCompleted);
// POST /videos/:videoId/comments
router.post('/:videoId/comments', auth(USER_ROLES.USER), videoManagementController.postComment);
// POST /videos/:videoId/comments/:commentId/replies
router.post('/:videoId/comments/:commentId/replies', auth(USER_ROLES.USER), videoManagementController.postReply);
router.post('/:videoId/comments/:commentId/like', auth(USER_ROLES.USER), videoManagementController.likeVideoComment);
// POST /videos/:videoId/comments/:commentId/replies/:replyId/like
router.post('/:videoId/comments/:commentId/replies/:replyId/like', auth(USER_ROLES.USER), videoManagementController.likeVideoReply);
// Unlike routes
router.post('/:videoId/comments/:commentId/unlike', auth(USER_ROLES.USER), videoManagementController.unlikeVideoComment);
router.post('/:videoId/comments/:commentId/replies/:replyId/unlike', auth(USER_ROLES.USER), videoManagementController.unlikeVideoReply);
// Delete routes
router.delete('/:videoId/comments/:commentId', auth(USER_ROLES.USER), videoManagementController.removeComment);
router.delete('/:videoId/comments/:commentId/replies/:replyId', auth(USER_ROLES.USER), videoManagementController.removeReply);
router.get('/:videoId/comments', auth(USER_ROLES.USER), videoManagementController.getComments);

export const videoManagementRoute = router;

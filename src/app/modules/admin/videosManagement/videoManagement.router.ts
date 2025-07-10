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
router.get('/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), videoManagementController.getSingleVideo);
router.post('/upload-video', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(VideoVelidationSchema.videoValidation), videoManagementController.addVideos);
router.put('/update-video/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, videoManagementController.updateVideos);
router.put('/video-status/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(VideoVelidationSchema.videoStatusValidation), videoManagementController.statusChange);
router.delete('/video-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.removeVideos);
router.post('/mark-video-watched/:videoId', auth(USER_ROLES.USER), videoManagementController.markVideoAsCompleted);
router.get('/get-all-videos-by-course/:subCategoryId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.getAllVideosByCourse);
router.post('/copy-video', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), videoManagementController.copyVideo);
// POST /videos/:videoId/comments

export const videoManagementRoute = router;

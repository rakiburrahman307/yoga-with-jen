import express from "express";
import auth from "../../../middleware/auth";
import { USER_ROLES } from "../../../../enums/user";
import { VideoController } from "./video.controller";
const router = express.Router();

router.get('/get-all-videos-by-course/:subCategoryId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.getAllVideosByCourse);
router.delete('/delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.deleteVideo);
router.patch('/update-video-status/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.updateVideoStatus);
router.get('/get-single-video-for-admin/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.getSingleVideoForAdmin);
router.post('/mark-video-watched/:videoId', auth(USER_ROLES.USER), VideoController.markVideoAsCompleted);
router.get('/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), VideoController.getSingleVideo);
router.put('/update-by-admin/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.updateVideo);
router.post('/shuffle', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.shuffleVideoSerial);

export const VideoRoutes = router;
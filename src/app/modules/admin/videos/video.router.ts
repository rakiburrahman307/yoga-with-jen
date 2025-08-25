import express from "express";
import auth from "../../../middleware/auth";
import { USER_ROLES } from "../../../../enums/user";
import { VideoController } from "./video.controller";

const router = express.Router();



router.get('/get-all-videos-by-course/:subCategoryId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.getAllVideosByCourse);
router.delete('/delete-video/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), VideoController.deleteVideo);


router.post('/mark-video-watched/:videoId', auth(USER_ROLES.USER), VideoController.markVideoAsCompleted);
export const VideoLibraryRoutes = router;
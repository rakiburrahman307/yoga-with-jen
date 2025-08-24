import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { FavoriteVideosController } from './favorite.controller';

const router = express.Router();

router.post('/:videoId', auth(USER_ROLES.USER), FavoriteVideosController.likedVideosOrUnlike);
router.get('/', auth(USER_ROLES.USER), FavoriteVideosController.getFavoriteVideos);
router.get('/watch/:id', auth(USER_ROLES.USER), FavoriteVideosController.getSingleVideo);
router.delete('/:videoId', auth(USER_ROLES.USER), FavoriteVideosController.removeLikedVideos);

export const FavoriteVideosRouter = router;

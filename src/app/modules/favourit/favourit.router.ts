import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { FavouritVideosController } from './favourit.controller';

const router = express.Router();

router.post('/:videoId', auth(USER_ROLES.USER), FavouritVideosController.likedVideosOrUnliked);
router.get('/', auth(USER_ROLES.USER), FavouritVideosController.getFavouritVideos);
router.get('/watch/:id', auth(USER_ROLES.USER), FavouritVideosController.getSingleVideo);
router.delete('/:videoId', auth(USER_ROLES.USER), FavouritVideosController.removeLikedVideos);

export const FavouritdRouter = router;

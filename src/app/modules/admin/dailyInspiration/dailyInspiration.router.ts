import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middleware/validateRequest';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';
import { DailyInspirationController } from './dailyInspiration.controller';
import { CreateDailyInspiration } from './dailyInspiration.validation';

const router = express.Router();

// Route to create a new "Create Post" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(CreateDailyInspiration.createDailyInspiration), DailyInspirationController.createPost);

// Route to get all "Create Post" entries
router.get('/letest', auth(USER_ROLES.USER), DailyInspirationController.getAllCreatePost);
// Route to get all "Create Post" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DailyInspirationController.getAllCreatePostForAdmin);

// Route to get a specific "Create Post" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DailyInspirationController.singlePost);

// Route to update an existing "Create Post" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, DailyInspirationController.updatePost);

// Route to delete a "Create Post" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DailyInspirationController.deletePost);

export const DailyInspirationRoutes = router;

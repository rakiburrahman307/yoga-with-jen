import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middleware/validateRequest';
import { CreatePostValidation } from './creaetPost.validation';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';
import { CreatePostController } from './createPost.controller';

const router = express.Router();

// Route to create a new "Create Post" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(CreatePostValidation.createPost), CreatePostController.createPost);

// Route to get all "Create Post" entries
router.get('/letest', auth(USER_ROLES.USER), CreatePostController.getAllCreatePostForApp);
// Route to get all "Create Post" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreatePostController.getAllCreatePost);

// Route to get a specific "Create Post" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreatePostController.singlePost);

// Route to update an existing "Create Post" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreatePostController.updatePost);

// Route to update status an existing "Create Post" entry by ID
router.patch('/status/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreatePostController.updateStatus);

// Route to delete a "Create Post" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreatePostController.deletePost);

export const CreatePostRoutes = router;

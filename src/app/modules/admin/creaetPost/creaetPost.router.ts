import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { CreaetPostController } from './creaetPost.controller';
import validateRequest from '../../../middleware/validateRequest';
import { CreatePostValidation } from './creaetPost.validation';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';

const router = express.Router();

// Route to create a new "Create Post" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(CreatePostValidation.createPost), CreaetPostController.createPost);

// Route to get all "Create Post" entries
router.get('/letest', auth(USER_ROLES.USER), CreaetPostController.getAllCreatePostForApp);
// Route to get all "Create Post" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreaetPostController.getAllCreatePost);

// Route to get a specific "Create Post" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreaetPostController.singlePost);

// Route to update an existing "Create Post" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, CreaetPostController.updatePost);

// Route to delete a "Create Post" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CreaetPostController.deletePost);

export const CreatePostRoutes = router;

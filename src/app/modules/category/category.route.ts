import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
const router = express.Router();

router.post(
     '/create',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     fileUploadHandler(),
     parseFileData(FOLDER_NAMES.THUMBNAIL),
     validateRequest(CategoryValidation.createCategoryZodSchema),
     CategoryController.createCategory,
);
router.get('/get-videos/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER), CategoryController.getVideosByCategory);
router.get('/single/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER), CategoryController.getSingleCategory);
router.route('/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(), parseFileData(FOLDER_NAMES.THUMBNAIL), CategoryController.updateCategory);
router
     .route('/:id')
     .put(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(CategoryValidation.updateCategoryStatusZodSchema), CategoryController.updateCategoryStatus)
     .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CategoryController.deleteCategory);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER), CategoryController.getCategories);
router.get('/subcategory/:id', auth(USER_ROLES.USER), CategoryController.getSubcategorisByCategoris);

export const CategoryRoutes = router;

import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { CategoryController } from './subCategory.controller';
import { CategoryValidation } from './subCategory.validation';
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
     validateRequest(CategoryValidation.createSubCategoryZodSchema),
     CategoryController.createSubCategory,
);
router.get('/get-videos/:id', auth(USER_ROLES.USER), CategoryController.getVideosBySubCategiry);
router.get('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), CategoryController.getCategoryRelatedSubCategory);
router.get('/single/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), CategoryController.getSubcategorisById);
router
     .route('/:id')
     .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(), parseFileData(FOLDER_NAMES.THUMBNAIL), CategoryController.updateSubCategory)
     .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CategoryController.deleteSubCategory);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER), CategoryController.getSubCategories);

export const SubCategoryRoutes = router;

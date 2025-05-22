import express from 'express';
import { userManagementController } from './userManagement.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middleware/validateRequest';
import { userManagementValidation } from './userManagement.validation';

const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), userManagementController.getAllUsers);
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), userManagementController.getUser);
router.put('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(userManagementValidation.statusValidation), userManagementController.userStatusChange);

export const userManagementRouter = router;

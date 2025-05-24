import express from 'express';
import { QuotationManagementController } from './quotationManagement.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = express.Router();

// Routes for handling quotations
router.post('/create', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), QuotationManagementController.createQuotation);
router.get('/', QuotationManagementController.getAllQuotation);
router.get('/', QuotationManagementController.getAllQuotation);
router.get('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), QuotationManagementController.getByIdQuotation);
router.patch('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), QuotationManagementController.updateQuotation);
router.put('/status/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), QuotationManagementController.updateStatusQuotation);
router.delete('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), QuotationManagementController.deleteQuotation);

export const quotationManagementRouter = router;

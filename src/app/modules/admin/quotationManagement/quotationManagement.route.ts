import express from 'express';
import { QuotationManagementController } from './quotationManagement.controller';
const router = express.Router();

// Routes for handling quotations
router.post('/create', QuotationManagementController.createQuotation);
router.get('/', QuotationManagementController.getAllQuotation);
router.get('/:id', QuotationManagementController.getByIdQuotation);
router.put('/:id', QuotationManagementController.updateQuotation);
router.delete('/:id', QuotationManagementController.deleteQuotation);

export const userManagementRouter = router;

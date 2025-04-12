import express from 'express';
import { QuotationManagementController } from './quotationManagement.controller';
const router = express.Router();

// Routes for handling quotations
router.post('/create', QuotationManagementController.createQuotation);
router.get('/', QuotationManagementController.getAllQuotation);
router.get('/:id', QuotationManagementController.getByIdQuotation);
router.patch('/:id', QuotationManagementController.updateQuotation);
router.put('/status/:id', QuotationManagementController.updateStatusQuotation);
router.delete('/:id', QuotationManagementController.deleteQuotation);

export const quotationManagementRouter = router;

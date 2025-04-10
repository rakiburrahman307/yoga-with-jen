
import mongoose, { Schema } from 'mongoose';
import { IQuotation } from './quotationManagement.interface';
const quotationSchema = new Schema<IQuotation>({
  quotation: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, {
  timestamps: true, 
});

export const Quotation = mongoose.model<IQuotation>('Quotation', quotationSchema);

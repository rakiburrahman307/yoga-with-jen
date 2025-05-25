import mongoose, { Schema } from 'mongoose';
import { IQuotation } from './quotationManagement.interface';
const quotationSchema = new Schema<IQuotation>(
     {
          quotation: { type: String, required: true, trim: true },
          releaseAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['active', 'inactive'], default: 'active' },
     },
     {
          timestamps: true,
     },
);

export const Quotation = mongoose.model<IQuotation>('Quotation', quotationSchema);

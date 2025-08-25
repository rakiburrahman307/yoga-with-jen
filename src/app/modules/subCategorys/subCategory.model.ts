import { model, Schema } from 'mongoose';
import { ISubCategory } from './subCategory.interface';

// sub category
const subCategorySchema = new Schema<ISubCategory>(
     {
          name: { type: String, required: true },
          thumbnail: { type: String, required: true },
          videoCount: { type: Number, default: 0 },
          type: { type: String, enum: ['course'], required: false, default: 'course' },
          description: { type: String, default: '' },
          categoryId: {
               type: Schema.Types.ObjectId,
               ref: 'Category',
               required: true,
          },
          equipment: { type: [String], required: true },
          status: {
               type: String,
               enum: ['active', 'inactive'],
               default: 'active',
          },
     },
     {
          timestamps: true,
     },
);

export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);

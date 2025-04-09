import { model, Schema } from 'mongoose';
import { ISubCategory } from '../category/category.interface';

// sub category
const subCategorySchema = new Schema<ISubCategory>({
  name: { type: String, required: true },
  thumbnail: { type: String, required: true },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
});

export const SubCategory = model<ISubCategory>(
  'SubCategory',
  subCategorySchema,
);

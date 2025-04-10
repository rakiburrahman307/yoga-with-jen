import { model, Schema } from 'mongoose';
import { ISubCategory } from './subCategory.interface';

// sub category
const subCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    videoCount: { type: Number, default: 0 },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SubCategory = model<ISubCategory>(
  'SubCategory',
  subCategorySchema,
);

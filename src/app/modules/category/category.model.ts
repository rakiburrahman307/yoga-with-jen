import mongoose, { model, Schema } from 'mongoose';
import { ICategory, ISubCategory } from './category.interface';
import { CategoryModel } from '../subCategorys/subCategory.interface';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    thumbnail: { type: String, required: true },
    subCategory: {
      type: [Schema.Types.ObjectId],
      ref: 'SubCategory',
      default: [],
    },
    videoCount: { type: Number, default: 0 },
    categoryType: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true },
);

export const Category = model<ICategory, CategoryModel>(
  'Category',
  categorySchema,
);

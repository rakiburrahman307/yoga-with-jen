import { Model } from 'mongoose';

interface ICategory {
  name: string;
  thumbnail: string;
  subCategory: number;
  videoCount: number;
  createdDate: Date;
  categoryType: string;
  status: string;
}

export type CategoryModel = Model<ICategory, Record<string, unknown>>;

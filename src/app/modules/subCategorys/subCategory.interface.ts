import { Types } from 'mongoose';

export interface ISubCategory {
     name: string;
     thumbnail: string;
     categoryId: Types.ObjectId;
     videoCount: number;
     status: string;
     categoryType: string;
}

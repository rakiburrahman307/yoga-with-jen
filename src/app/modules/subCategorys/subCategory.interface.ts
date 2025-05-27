import { Types } from 'mongoose';

export interface ISubCategory {
     name: string;
     thumbnail: string;
     description: string;
     categoryId: Types.ObjectId;
     videoCount: number;
     equipment: string[];
     status: string;
     categoryType: string;
}

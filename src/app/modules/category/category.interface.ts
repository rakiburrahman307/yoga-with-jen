import mongoose from 'mongoose';
export interface ISubCategory {
     name: string;
     thumbnail: string;
     categoryId: mongoose.Schema.Types.ObjectId;
}

export interface ICategory {
     name: string;
     thumbnail: string;
     subCategory: ISubCategory[] | [];
     videoCount: number;
     categoryType: string;
     status: string;
     isDeleted: boolean;
}

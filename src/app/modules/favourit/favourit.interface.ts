import { Types } from 'mongoose';
export interface IFavourite {
     userId: Types.ObjectId;
     videoId: Types.ObjectId;
     liked: boolean;
}

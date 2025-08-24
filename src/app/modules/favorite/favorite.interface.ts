import { Types } from 'mongoose';
export interface IFavorite {
     userId: Types.ObjectId;
     videoId: Types.ObjectId;
     liked: boolean;
}

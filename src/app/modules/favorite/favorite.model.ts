import mongoose, { Schema } from 'mongoose';
import { IFavorite } from './favorite.interface';

const likesSchema = new Schema<IFavorite>(
     {
          userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
          videoId: {
               type: mongoose.Schema.ObjectId,
               ref: 'Videos',
               required: true,
          },
          liked: {
               type: Boolean,
               default: true,
          },
     },
     { timestamps: true },
);

export const Favorite = mongoose.model<IFavorite>('Favorite', likesSchema);

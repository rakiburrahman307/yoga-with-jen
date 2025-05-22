import mongoose, { Schema } from 'mongoose';
import { IFavourite } from './favourit.interface';

const likesSchema = new Schema<IFavourite>(
     {
          userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
          videoId: {
               type: mongoose.Schema.ObjectId,
               ref: 'Video',
               required: true,
          },
          liked: {
               type: Boolean,
               default: true,
          },
     },
     { timestamps: true },
);

export const Favourite = mongoose.model<IFavourite>('Favourite', likesSchema);

import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Favourite } from './favourit.model';

const likedVideos = async (userId: string, videoId: string) => {
  // Start a session for a transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingLike = await Favourite.findOne({ userId, videoId }).session(
      session,
    );

    if (existingLike) {
      await Favourite.deleteOne({ userId, videoId }).session(session);

      await session.commitTransaction();
      return { isLiked: false };
    } else {
      const newLike = new Favourite({ userId, videoId });
      await newLike.save({ session });

      await session.commitTransaction();
      return { isLiked: true };
    }
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during like/unlike process:', error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while processing your like/unlike action',
    );
  } finally {
    session.endSession();
  }
};

const deleteFavouriteVideos = async (userId: string, videoId: string) => {
  const likedVideo = await Favourite.findOne({ userId, videoId });
  if (!likedVideo) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found in favourite');
  }

  const deleteProduct = await Favourite.findByIdAndDelete(likedVideo._id);
  if (!deleteProduct) {
    throw new AppError(StatusCodes.NOT_FOUND, "Favourite  item can't deleted!");
  }
  return deleteProduct;
};

const getAllFavouritList = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(Favourite.find({ userId }), query);
  const favouritList = await queryBuilder.fields().paginate().modelQuery.exec();

  const meta = await queryBuilder.countTotal();
  return { favouritList, meta };
};
export const FavouritVideosSevices = {
  likedVideos,
  getAllFavouritList,
  deleteFavouriteVideos,
};

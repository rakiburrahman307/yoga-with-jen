import { StatusCodes } from "http-status-codes";
import AppError from "../../../../errors/AppError";
import QueryBuilder from "../../../builder/QueryBuilder";
import { User } from "../../user/user.model";
import { Videos } from "./video.model";
import mongoose from "mongoose";
import { checkNextVideoUnlock } from "../../../../helpers/checkNExtVideoUnlock";
import { Favorite } from "../../favorite/favorite.model";
import { IVideos } from "./video.interface";

const getFevVideosOrNot = async (videoId: string, userId: string) => {
    const favorite = await Favorite.findOne({ videoId, userId });
    return favorite ? true : false;
};
const getVideosByCourse = async (id: string, query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder(Videos.find({ subCategoryId: id }).populate('categoryId', 'name').populate('subCategoryId', 'name'), query);
    const videos = await queryBuilder.fields().filter().paginate().search([]).sort().modelQuery.exec();
    const meta = await queryBuilder.countTotal();
    return {
        videos,
        meta,
    };
};
const markVideoAsCompleted = async (userId: string, videoId: string) => {
    try {
        // Find the user first
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
        }

        // Convert videoId to ObjectId if using MongoDB ObjectIds
        const videoObjectId = new mongoose.Types.ObjectId(videoId);

        // Check if video is already completed (more reliable comparison)
        const isAlreadyCompleted = user.completedSessions.some((sessionId) => sessionId.toString() === videoId.toString());

        if (!isAlreadyCompleted) {
            // Find the video to get subcategory info
            const currentVideo = await Videos.findById(videoId);
            if (!currentVideo) {
                throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
            }

            // Use findByIdAndUpdate with proper options
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $push: { completedSessions: videoObjectId } },
                {
                    new: true, // Return updated document
                    runValidators: true, // Run schema validations
                },
            );

            if (!updatedUser) {
                throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to mark video as completed');
            }

            // Check what gets unlocked next
            const nextVideoInfo = await checkNextVideoUnlock(userId, currentVideo?.subCategoryId.toString(), videoId);


            return {
                success: true,
                message: 'Video marked as completed',
                completedSessions: updatedUser.completedSessions,
                nextVideoInfo: nextVideoInfo,
            };
        } else {
            return {
                success: true,
                message: 'Video already completed',
                completedSessions: user.completedSessions,
                nextVideoInfo: { nextVideoUnlocked: false, reason: 'Already completed' },
            };
        }
    } catch (error) {
        console.log('Error marking video as completed:', error);
        throw error;
    }
};
const deleteVideo = async (id: string) => {
    const result = await Videos.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
    }
    return result;
};
const getSingleVideoFromDb = async (id: string, userId: string) => {
    const result = await Videos.findById(id).populate('categoryId', 'name').populate('subCategoryId', 'name');
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
    }

    const hasSubscription = await User.hasActiveSubscription(userId);
    const isFavorite = await getFevVideosOrNot(id, userId);
    if (hasSubscription) {
        // If the user has an active subscription or the video is free
        const data = {
            ...result.toObject(),
            isFavorite,
        };
        return data;
    }

    // If the user doesn't have a subscription and the video is paid
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access');
};
const updateVideoStatus = async (id: string, status: string) => {
    const result = await Videos.findByIdAndUpdate(id, { status }, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
    }
    return result;
};
const getSingleVideoForAdmin = async (id: string) => {
    const result = await Videos.findById(id);
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
    }
    return result;
};

const updateVideo = async (id: string, payload: Partial<IVideos>) => {
    const result = await Videos.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
    }
    return result;
};
const shuffleVideoSerial = async (videoOrder: Array<{ _id: string; serial: number }>) => {
    if (!videoOrder || !Array.isArray(videoOrder) || videoOrder.length === 0) {
        return;
    }
    const updatePromises = videoOrder.map((item) => Videos.findByIdAndUpdate(item._id, { serial: item.serial }, { new: true }));

    const result = await Promise.all(updatePromises);
    return result;
};
export const VideoService = {
    getVideosByCourse,
    markVideoAsCompleted,
    deleteVideo,
    getSingleVideoFromDb,
    updateVideoStatus,
    getSingleVideoForAdmin,
    updateVideo,
    shuffleVideoSerial,
};

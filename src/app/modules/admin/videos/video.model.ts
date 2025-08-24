import mongoose, { Schema } from 'mongoose';
import { IVideos } from './video.interface';


// 🎥 Video schema with embedded comments
const VideoSchema = new Schema<IVideos>(
    {
        title: { type: String, required: true },
        serial: { type: Number, default: 1 },
        type: { type: String, enum: ['class', 'course'], required: false },
        category: { type: String, required: true },
        subCategory: { type: String, required: false },
        categoryId: { type: String, required: true },
        subCategoryId: { type: String, required: false },
        duration: { type: String, required: true },
        equipment: { type: [String], required: true },
        thumbnailUrl: { type: String, required: true },
        videoUrl: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    },
    { timestamps: true },
);

export const Videos = mongoose.model<IVideos>('Videos', VideoSchema);

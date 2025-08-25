import mongoose from 'mongoose';

export interface IChallenge {
     title: string;
     serial: number;
     challengeId: mongoose.Types.ObjectId;
     challengeName: string;
     duration: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     publishAt: Date;
     status: 'active' | 'inactive';
}
export type VideoIdInput = string | mongoose.Types.ObjectId | (string | mongoose.Types.ObjectId)[];

export interface IChallengeCategory {
     _id: mongoose.Types.ObjectId;
     name: string;
     description?: string;
     videoCount?: number;
     isActive?: boolean;
     createdAt?: Date;
     updatedAt?: Date;
}


import mongoose from 'mongoose';

export interface IChallenge {
     title: string;
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

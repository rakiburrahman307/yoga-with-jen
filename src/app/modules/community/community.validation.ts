import { z } from 'zod';

const createPostSchema = z.object({
     userId: z.string().min(1, 'User ID is required'),
     content: z.string().min(1, 'Content is required').max(500, 'Content cannot exceed 500 characters'),
});

export const CommunityValidationShema = { createPostSchema };

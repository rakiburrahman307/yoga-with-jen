import { z } from 'zod';

const createPost = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Category is required').trim(),
    duration: z.string().min(1, 'Duration is required'),
    equipment: z.array(z.string()).min(1, 'At least one equipment is required'),
    thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL'),
    videoUrl: z.string().url('Video URL must be a valid URL'),
    description: z.string().min(1, 'Description is required'),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const CreatePostValidation = {
  createPost,
};

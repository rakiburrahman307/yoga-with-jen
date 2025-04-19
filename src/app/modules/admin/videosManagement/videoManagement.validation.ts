import { z } from 'zod';

export const videoValidation = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    category: z.string().min(1, 'Category is required'),
    subCategory: z.string().min(1, 'Sub Category is required'),
    duration: z.string().min(5, 'Duration is required'),
    equipment: z.string().min(1, 'Equipment is required'),
    thumbnail: z.string().url('Thumbnail URL must be a valid URL'),
    videoUrl: z.string().url('Video URL must be a valid URL'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
  }),
});

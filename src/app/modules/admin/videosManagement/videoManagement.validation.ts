import { z } from 'zod';

const videoValidation = z.object({
     body: z.object({
          title: z.string().min(3, 'Title must be at least 3 characters long'),
          categoryId: z.string().min(1, 'Category is required'),
          duration: z.string().min(1, 'Duration is required'),
          equipment: z.array(z.string()).nonempty('Equipment list cannot be empty'),
          thumbnailUrl: z.string({
               required_error: 'Thumbnail URL must be a valid URL',
          }),
          videoUrl: z.string({ required_error: 'Video URL must be a valid URL' }),
          description: z.string().min(10, 'Description must be at least 10 characters long'),
     }),
});

const videoStatusValidation = z.object({
     body: z.object({
          status: z.enum(['active', 'inactive']).refine((val) => ['active', 'inactive'].includes(val), {
               message: 'Status must be either active or inactive',
          }),
     }),
});

export const VideoVelidationSchema = { videoValidation, videoStatusValidation };

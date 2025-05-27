import { z } from 'zod';

const createPost = z.object({
     body: z.object({
          title: z.string().optional(),
          type: z.string().optional(),
          duration: z.string().optional(),
          equipment: z.array(z.string()).min(1, 'At least one equipment is required').optional(),
          description: z.string().optional(),
     }),
});

export const CreatePostValidation = {
     createPost,
};

import { z } from 'zod';

const createCommentsSchema = z.object({
     body: z.object({
          content: z.string().min(1, 'Content cannot be empty'),
     }),
});

export const CommentsValidationSchema = {
     createCommentsSchema,
};

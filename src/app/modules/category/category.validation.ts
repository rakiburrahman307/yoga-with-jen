import { z } from 'zod';

const createCategoryZodSchema = z.object({
     body: z.object({
          name: z.string({ required_error: 'Category name is required' }),
          categoryType: z.string({ required_error: 'Category type is required' }),
     }),
});

const updateCategoryZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
          categoryType: z.string().optional(),
     }),
});
const updateCategoryStatusZodSchema = z.object({
     body: z.object({
          status: z.enum(['active', 'inactive']),
     }),
});

export const CategoryValidation = {
     createCategoryZodSchema,
     updateCategoryZodSchema,
     updateCategoryStatusZodSchema,
};

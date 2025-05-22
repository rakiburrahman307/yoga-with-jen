import { z } from 'zod';

const createSubCategoryZodSchema = z.object({
     body: z.object({
          name: z.string({ required_error: 'Sub category name is required' }),
          categoryId: z.string({ required_error: 'Category id name is required' }),
     }),
});

const updateSubCategoryZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
     }),
});

export const CategoryValidation = {
     createSubCategoryZodSchema,
     updateSubCategoryZodSchema,
};

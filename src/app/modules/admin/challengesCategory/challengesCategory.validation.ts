import { z } from 'zod';

const createDailyInspiration = z.object({
     body: z.object({
          title: z.string().min(1, 'Title is required'),
          category: z.string().min(1, 'Category is required').trim(),
          duration: z.string().min(1, 'Duration is required'),
          equipment: z.array(z.string()).min(1, 'At least one equipment is required'),
          description: z.string().min(1, 'Description is required'),
     }),
});

export const CreateDailyInspiration = {
     createDailyInspiration,
};

import { z } from 'zod';

const createDailyInspiration = z.object({
     body: z.object({
          title: z.string().min(1, 'Title is required'),
          challengeId: z.string().min(1, 'Challenge Id is required'),
          equipment: z.array(z.string()).min(1, 'At least one equipment is required'),
          description: z.string().min(1, 'Description is required'),
     }),
});

export const CreateDailyInspiration = {
     createDailyInspiration,
};

import { z } from 'zod';

const statusValidation = z.object({
     body: z.object({
          status: z.string(),
     }),
});

export const userManagementValidation = {
     statusValidation,
};

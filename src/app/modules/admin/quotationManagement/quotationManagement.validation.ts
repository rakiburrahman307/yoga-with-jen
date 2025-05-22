import { z } from 'zod';

const statusValidation = z.object({
     body: z.object({
          status: z.enum(['active', 'inactive']),
     }),
});

export const quotationManagementValidation = {
     statusValidation,
};

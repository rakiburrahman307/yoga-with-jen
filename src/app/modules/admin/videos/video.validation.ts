import { z } from 'zod';

const createVideoValidation = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required',
        }).min(3, 'Title must be at least 3 characters long').max(200, 'Title cannot exceed 200 characters'),
        
        serial: z.number({
            required_error: 'Serial number is required',
        }).int().positive('Serial must be a positive integer'),
        
        type: z.enum(['class', 'course'], {
            required_error: 'Type is required',
            invalid_type_error: 'Type must be either class or course',
        }),
        
        category: z.string({
            required_error: 'Category is required',
        }).min(1, 'Category cannot be empty'),
        
        subCategory: z.string().optional(),
        
        categoryId: z.string({
            required_error: 'Category ID is required',
        }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
        
        subCategoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subcategory ID format').optional(),
        
        duration: z.string({
            required_error: 'Duration is required',
        }).min(1, 'Duration cannot be empty'),
        
        equipment: z.array(z.string().min(1, 'Equipment item cannot be empty'), {
            required_error: 'Equipment list is required',
        }).nonempty('At least one equipment item is required'),
        
        thumbnailUrl: z.string({
            required_error: 'Thumbnail URL is required',
        }).url('Thumbnail URL must be a valid URL'),
        
        videoUrl: z.string({
            required_error: 'Video URL is required',
        }).url('Video URL must be a valid URL'),
        
        description: z.string({
            required_error: 'Description is required',
        }).min(10, 'Description must be at least 10 characters long').max(2000, 'Description cannot exceed 2000 characters'),
        
        status: z.enum(['active', 'inactive']).default('active'),
    }),
});

const updateVideoValidation = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters long').max(200, 'Title cannot exceed 200 characters').optional(),
        
        serial: z.number().int().positive('Serial must be a positive integer').optional(),
        
        type: z.enum(['class', 'course'], {
            invalid_type_error: 'Type must be either class or course',
        }).optional(),
        
        category: z.string().min(1, 'Category cannot be empty').optional(),
        
        subCategory: z.string().optional(),
        
        categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format').optional(),
        
        subCategoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subcategory ID format').optional(),
        
        duration: z.string().min(1, 'Duration cannot be empty').optional(),
        
        equipment: z.array(z.string().min(1, 'Equipment item cannot be empty')).nonempty('At least one equipment item is required').optional(),
        
        thumbnailUrl: z.string().url('Thumbnail URL must be a valid URL').optional(),
        
        videoUrl: z.string().url('Video URL must be a valid URL').optional(),
        
        description: z.string().min(10, 'Description must be at least 10 characters long').max(2000, 'Description cannot exceed 2000 characters').optional(),
        
        status: z.enum(['active', 'inactive']).optional(),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
    }),
});

const videoStatusValidation = z.object({
    body: z.object({
        status: z.enum(['active', 'inactive'], {
            required_error: 'Status is required',
            invalid_type_error: 'Status must be either active or inactive',
        }),
    }),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
    }),
});

const videoIdValidation = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
    }),
});

const likeVideoValidation = z.object({
    params: z.object({
        videoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
    }),
});

const copyVideoValidation = z.object({
    body: z.object({
        videoIds: z.union([
            z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
            z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format')).nonempty('At least one video ID is required'),
        ], {
            required_error: 'Video IDs are required',
        }),
        
        categoryId: z.string({
            required_error: 'Category ID is required',
        }).regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
        
        subCategoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subcategory ID format').optional(),
    }),
});

const markVideoCompletedValidation = z.object({
    params: z.object({
        videoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid video ID format'),
    }),
});

const getVideosByCategoryValidation = z.object({
    params: z.object({
        categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID format'),
    }),
});

const getVideosBySubCategoryValidation = z.object({
    params: z.object({
        subCategoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subcategory ID format'),
    }),
});

export const VideoValidationSchema = {
    createVideoValidation,
    updateVideoValidation,
    videoStatusValidation,
    videoIdValidation,
    likeVideoValidation,
    copyVideoValidation,
    markVideoCompletedValidation,
    getVideosByCategoryValidation,
    getVideosBySubCategoryValidation,
};
// Comprehensive validation schemas for City Experts API
import { z } from 'zod';

// Base schemas for reusable components
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const uuidSchema = z.string()
  .uuid('Invalid UUID format');

export const mongoIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

// Multilingual content schema
export const multiLingualSchema = z.object({
  en: z.string().min(1, 'English content is required').max(1000),
  ar: z.string().min(1, 'Arabic content is required').max(1000)
});

// Cloudinary image schema
export const cloudinaryImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  public_id: z.string().min(1, 'Public ID is required'),
  alt: z.string().max(255, 'Alt text must be less than 255 characters').optional().default('')
});

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128)
});

export const sessionSchema = z.object({
  sub: emailSchema,
  iat: z.number().int().positive(),
  exp: z.number().int().positive().optional()
});

// Project schemas
export const projectStatusSchema = z.enum(['draft', 'published', 'archived'], {
  errorMap: () => ({ message: 'Status must be draft, published, or archived' })
});

export const projectCategorySchema = z.enum([
  'commercial', 'residential', 'hospitality', 'retail', 'office', 'industrial'
], {
  errorMap: () => ({ message: 'Invalid project category' })
});

export const projectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  title: multiLingualSchema,
  description: multiLingualSchema,
  category: projectCategorySchema,
  status: projectStatusSchema,
  featured: z.boolean().default(false),
  completionDate: z.string().datetime().optional(),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required').default('UAE'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional()
  }),
  images: z.object({
    hero: cloudinaryImageSchema.optional(),
    thumbnail: cloudinaryImageSchema.optional(),
    gallery: z.array(cloudinaryImageSchema).max(20, 'Maximum 20 gallery images allowed')
  }),
  specifications: z.object({
    area: z.number().positive().optional(),
    budget: z.number().positive().optional(),
    duration: z.number().positive().optional() // in months
  }).optional(),
  client: z.string().max(255).optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').default([])
});

export const createProjectSchema = projectSchema.omit({ id: true });
export const updateProjectSchema = projectSchema.partial().required({ id: true });

// Project image update schema
export const projectImageUpdateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  slot: z.enum(['hero', 'thumbnail', 'gallery'], {
    errorMap: () => ({ message: 'Slot must be hero, thumbnail, or gallery' })
  }),
  url: z.string().url('Invalid image URL'),
  public_id: z.string().min(1, 'Public ID is required'),
  alt: z.string().max(255, 'Alt text must be less than 255 characters').optional().default('')
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'Name can only contain letters and spaces'),
  email: emailSchema,
  phone: z.string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  projectType: z.enum(['commercial', 'residential', 'consultation', 'other'])
    .optional(),
  budget: z.enum(['under-100k', '100k-500k', '500k-1m', '1m-5m', 'over-5m'])
    .optional(),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6-12months', 'flexible'])
    .optional(),
  preferredContact: z.enum(['email', 'phone', 'whatsapp'])
    .default('email')
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.object({
    name: z.string().min(1, 'Filename is required'),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    type: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type),
      'File must be JPEG, PNG, WebP, or AVIF format'
    )
  }),
  folder: z.string().min(1, 'Folder is required').default('uploads'),
  transformation: z.object({
    width: z.number().int().positive().max(4000).optional(),
    height: z.number().int().positive().max(4000).optional(),
    quality: z.number().int().min(1).max(100).default(80),
    format: z.enum(['auto', 'jpeg', 'png', 'webp', 'avif']).default('auto')
  }).optional()
});

// Query parameter schemas
export const projectsQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  category: projectCategorySchema.optional(),
  featured: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  offset: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, 'Offset must be 0 or greater')
    .optional(),
  search: z.string().max(100, 'Search query must be less than 100 characters').optional()
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.any().optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString())
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  data: z.any(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
  meta: z.object({
    total: z.number().optional(),
    limit: z.number().optional(),
    offset: z.number().optional()
  }).optional()
});

// CSRF token schema
export const csrfTokenSchema = z.string()
  .min(20, 'CSRF token must be at least 20 characters')
  .max(100, 'CSRF token must be less than 100 characters');

// Rate limiting schema
export const rateLimitSchema = z.object({
  key: z.string().min(1, 'Rate limit key is required'),
  max: z.number().int().positive().max(1000).default(20),
  windowMs: z.number().int().positive().max(24 * 60 * 60 * 1000).default(60000) // max 24 hours
});

// Environment variable schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ADMIN_EMAIL: emailSchema,
  ADMIN_PASSWORD_HASH: z.string().min(50, 'Password hash is too short'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'Cloudinary cloud name is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'Cloudinary API key is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'Cloudinary API secret is required'),
  CLOUDINARY_BASE_FOLDER: z.string().default('cityexperts'),
  SMTP_HOST: z.string().min(1, 'SMTP host is required'),
  SMTP_PORT: z.string().transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, 'Invalid SMTP port'),
  SMTP_USER: z.string().min(1, 'SMTP user is required'),
  SMTP_PASS: z.string().min(1, 'SMTP password is required'),
  MAIL_FROM: emailSchema,
  MAIL_TO: emailSchema
});

// Validation helper functions
export function validateRequest(schema, data) {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      success: false,
      error: 'Validation error',
      details: error.message
    };
  }
}

export function createValidationMiddleware(schema) {
  return (req, res, next) => {
    const result = validateRequest(schema, req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'validation_failed',
        message: result.error,
        details: result.details
      });
    }
    req.validatedData = result.data;
    next();
  };
}

// Type exports for TypeScript usage (will be enabled when TypeScript is implemented)
// export type Project = z.infer<typeof projectSchema>;
// export type CreateProject = z.infer<typeof createProjectSchema>;
// export type UpdateProject = z.infer<typeof updateProjectSchema>;
// export type ContactForm = z.infer<typeof contactFormSchema>;
// export type ProjectImageUpdate = z.infer<typeof projectImageUpdateSchema>;
// export type CloudinaryImage = z.infer<typeof cloudinaryImageSchema>;
// export type MultiLingual = z.infer<typeof multiLingualSchema>;
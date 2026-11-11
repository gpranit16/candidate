import { z } from 'zod';

export const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
export const workplaceTypes = ['Remote', 'Hybrid', 'On-site'] as const;
export const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead'] as const;
export const jobStatuses = ['draft', 'published', 'archived'] as const;

const salaryRangeSchema = z
  .object({
    min: z.coerce.number().min(0).optional().nullable(),
    max: z.coerce.number().min(0).optional().nullable(),
    currency: z.string().trim().max(10).default('INR'),
    period: z.enum(['year', 'month']).default('year'),
    isDisclosed: z.boolean().default(false),
  })
  .refine(
    (s) => {
      if (s.min != null && s.max != null) {
        return s.max >= s.min;
      }
      return true;
    },
    { message: 'Maximum salary must be greater than or equal to minimum salary', path: ['max'] }
  );

export const createJobSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160),
  company: z.string().trim().min(2, 'Company must be at least 2 characters').max(140),
  companyDescription: z.string().trim().max(1500).optional().default(''),
  location: z.string().trim().min(2, 'Location is required').max(140),
  employmentType: z.enum(employmentTypes),
  workplaceType: z.enum(workplaceTypes),
  experienceLevel: z.enum(experienceLevels),
  category: z.string().trim().min(2, 'Category is required').max(100),
  salaryRange: salaryRangeSchema.optional().default({
    currency: 'INR',
    period: 'year',
    isDisclosed: false,
  }),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(8000),
  responsibilities: z.array(z.string().trim().min(1).max(500)).max(30).optional().default([]),
  requirements: z.array(z.string().trim().min(1).max(500)).max(30).optional().default([]),
  skills: z.array(z.string().trim().min(1).max(60)).max(30).optional().default([]),
  status: z.enum(jobStatuses).optional().default('draft'),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  search: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  employmentType: z.enum(employmentTypes).optional(),
  workplaceType: z.enum(workplaceTypes).optional(),
  experienceLevel: z.enum(experienceLevels).optional(),
  category: z.string().trim().max(100).optional(),
  minSalary: z.coerce.number().min(0).optional(),
  maxSalary: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'relevance']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(9),
});


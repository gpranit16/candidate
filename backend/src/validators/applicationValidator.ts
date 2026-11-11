import { z } from 'zod';
import { APPLICATION_STATUSES } from '../models/Application';

export const createApplicationSchema = z.object({
  jobId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID'),
  coverLetter: z.string().trim().max(4000, 'Cover letter is too long').optional().default(''),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  note: z.string().trim().max(1000, 'Note cannot exceed 1000 characters').optional().default(''),
});


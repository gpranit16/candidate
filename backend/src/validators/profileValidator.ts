import { z } from 'zod';

const educationItemSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required').max(150),
  degree: z.string().trim().min(1, 'Degree is required').max(120),
  fieldOfStudy: z.string().trim().min(1, 'Field of study is required').max(120),
  startYear: z.coerce.number().int().min(1950).max(2100),
  endYear: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
});

const experienceItemSchema = z.object({
  jobTitle: z.string().trim().min(1, 'Job title is required').max(120),
  company: z.string().trim().min(1, 'Company is required').max(120),
  description: z.string().trim().max(1500).optional().default(''),
  startDate: z.string().trim().min(1, 'Start date is required').max(30),
  endDate: z.string().trim().max(30).optional().nullable(),
  currentlyWorking: z.boolean().optional().default(false),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().trim().max(30).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  headline: z.string().trim().max(180).optional().default(''),
  bio: z.string().trim().max(2000).optional().default(''),
  skills: z.array(z.string().trim().min(1).max(60)).max(50).optional().default([]),
  education: z.array(educationItemSchema).max(20).optional().default([]),
  experience: z.array(experienceItemSchema).max(30).optional().default([]),
});


import mongoose, { Document, Model, Schema } from 'mongoose';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';
export type JobStatus = 'draft' | 'published' | 'archived';

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period: 'year' | 'month';
  isDisclosed: boolean;
}

export interface IJob extends Document {
  title: string;
  company: string;
  companyDescription: string;
  location: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceLevel: ExperienceLevel;
  category: string;
  salaryRange: ISalaryRange;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  status: JobStatus;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const salaryRangeSchema = new Schema<ISalaryRange>(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, trim: true, default: 'INR' },
    period: { type: String, enum: ['year', 'month'], default: 'year' },
    isDisclosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 160,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 140,
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 140,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: true,
    },
    workplaceType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 100,
    },
    salaryRange: {
      type: salaryRangeSchema,
      default: () => ({ currency: 'INR', period: 'year', isDisclosed: false }),
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 8000,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      required: true,
    },
    postedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

jobSchema.index(
  { title: 'text', company: 'text', description: 'text', skills: 'text', category: 'text' },
  { weights: { title: 10, skills: 6, company: 5, category: 4, description: 1 } }
);
jobSchema.index({ status: 1, postedAt: -1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ workplaceType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ 'salaryRange.min': 1, 'salaryRange.max': 1 });

export const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);


import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEducationItem {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
}

export interface IExperienceItem {
  jobTitle: string;
  company: string;
  description?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
}

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  phone: string;
  location: string;
  headline: string;
  bio: string;
  skills: string[];
  education: IEducationItem[];
  experience: IExperienceItem[];
  resumeFileId: mongoose.Types.ObjectId | null;
  profileCompletion: number;
  updatedAt: Date;
}

const educationSchema = new Schema<IEducationItem>(
  {
    institution: { type: String, required: true, trim: true, maxlength: 150 },
    degree: { type: String, required: true, trim: true, maxlength: 120 },
    fieldOfStudy: { type: String, required: true, trim: true, maxlength: 120 },
    startYear: { type: Number, required: true, min: 1950, max: 2100 },
    endYear: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false }
);

const experienceSchema = new Schema<IExperienceItem>(
  {
    jobTitle: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1500, default: '' },
    startDate: { type: String, required: true, trim: true },
    endDate: { type: String, trim: true },
    currentlyWorking: { type: Boolean, default: false },
  },
  { _id: false }
);

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    headline: { type: String, trim: true, maxlength: 180, default: '' },
    bio: { type: String, trim: true, maxlength: 2000, default: '' },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    resumeFileId: { type: Schema.Types.ObjectId, default: null },
    profileCompletion: { type: Number, min: 0, max: 100, default: 10 },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
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

export function computeProfileCompletion(profile: {
  name?: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  education?: IEducationItem[];
  experience?: IExperienceItem[];
  resumeFileId?: unknown;
}): number {
  let score = 0;
  if (profile.name && profile.name.trim().length >= 2) score += 10;
  if (profile.phone && profile.phone.trim().length >= 5) score += 10;
  if (profile.location && profile.location.trim().length >= 2) score += 10;
  if (profile.headline && profile.headline.trim().length >= 3) score += 15;
  if (profile.bio && profile.bio.trim().length >= 20) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.education && profile.education.length > 0) score += 10;
  if (profile.experience && profile.experience.length > 0) score += 10;
  if (profile.resumeFileId) score += 10;
  return Math.min(100, score);
}

export const CandidateProfile: Model<ICandidateProfile> =
  mongoose.models.CandidateProfile ||
  mongoose.model<ICandidateProfile>('CandidateProfile', candidateProfileSchema);

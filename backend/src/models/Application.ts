import mongoose, { Document, Model, Schema } from 'mongoose';

export const APPLICATION_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview',
  'Rejected',
  'Hired',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface IStatusHistoryItem {
  status: ApplicationStatus;
  changedAt: Date;
  note?: string;
  changedBy?: mongoose.Types.ObjectId;
}

export interface IApplication extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  resumeFileId: mongoose.Types.ObjectId | null;
  coverLetter: string;
  status: ApplicationStatus;
  statusHistory: IStatusHistoryItem[];
  appliedAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resumeFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Applied',
      required: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
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

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1, appliedAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ status: 1, updatedAt: -1 });

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);


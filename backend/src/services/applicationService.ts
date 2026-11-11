import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { CandidateProfile } from '../models/CandidateProfile';
import { Job } from '../models/Job';
import { AppError } from '../utils/AppError';

export async function submitApplication(
  candidateId: string,
  input: { jobId: string; coverLetter?: string }
) {
  if (!mongoose.Types.ObjectId.isValid(input.jobId)) {
    throw new AppError('Invalid job identifier.', 400, 'INVALID_JOB_ID');
  }

  const job = await Job.findById(input.jobId);
  if (!job) {
    throw new AppError('The selected job does not exist.', 404, 'JOB_NOT_FOUND');
  }
  if (job.status !== 'published') {
    throw new AppError('This job is not currently accepting applications.', 400, 'JOB_CLOSED');
  }

  const existing = await Application.findOne({
    candidateId,
    jobId: job._id,
  }).lean();

  if (existing) {
    throw new AppError(
      'You have already applied for this position.',
      409,
      'DUPLICATE_APPLICATION'
    );
  }

  const profile = await CandidateProfile.findOne({ userId: candidateId }).lean();
  const now = new Date();

  const application = await Application.create({
    candidateId,
    jobId: job._id,
    resumeFileId: profile?.resumeFileId || null,
    coverLetter: input.coverLetter || '',
    status: 'Applied',
    appliedAt: now,
    statusHistory: [
      {
        status: 'Applied',
        changedAt: now,
        note: 'Application submitted through Jobs Territory candidate portal.',
        changedBy: new mongoose.Types.ObjectId(candidateId),
      },
    ],
  });

  return application.toJSON();
}

export async function getCandidateApplications(candidateId: string) {
  const applications = await Application.find({ candidateId })
    .sort({ appliedAt: -1 })
    .populate({
      path: 'jobId',
      select: 'title company location employmentType workplaceType experienceLevel salaryRange status postedAt',
    })
    .lean();

  return applications.map((app) => {
    const populatedJob =
      app.jobId && typeof app.jobId === 'object' && '_id' in app.jobId
        ? (app.jobId as unknown as {
            _id: mongoose.Types.ObjectId;
            title: string;
            company: string;
            location: string;
            employmentType: string;
            workplaceType: string;
            experienceLevel: string;
            salaryRange?: unknown;
            status: string;
            postedAt?: Date | null;
          })
        : null;

    return {
      id: app._id.toString(),
      candidateId: app.candidateId.toString(),
      jobId: populatedJob ? populatedJob._id.toString() : String(app.jobId),
      job: populatedJob
        ? {
            id: populatedJob._id.toString(),
            title: populatedJob.title,
            company: populatedJob.company,
            location: populatedJob.location,
            employmentType: populatedJob.employmentType,
            workplaceType: populatedJob.workplaceType,
            experienceLevel: populatedJob.experienceLevel,
            salaryRange: populatedJob.salaryRange,
            status: populatedJob.status,
            postedAt: populatedJob.postedAt,
          }
        : null,
      resumeFileId: app.resumeFileId ? app.resumeFileId.toString() : null,
      coverLetter: app.coverLetter,
      status: app.status,
      statusHistory: app.statusHistory,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
    };
  });
}

export async function getCandidateApplicationById(
  applicationId: string,
  requester: { id: string; role: string }
) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new AppError('Invalid application identifier.', 400, 'INVALID_APPLICATION_ID');
  }

  const app = await Application.findById(applicationId)
    .populate({
      path: 'jobId',
      select: 'title company companyDescription location employmentType workplaceType experienceLevel category salaryRange status postedAt',
    })
    .lean();

  if (!app) {
    throw new AppError('Application not found.', 404, 'APPLICATION_NOT_FOUND');
  }

  if (requester.role !== 'admin' && app.candidateId.toString() !== requester.id) {
    throw new AppError(
      'You do not have permission to view this application.',
      403,
      'FORBIDDEN'
    );
  }

  const populatedJob =
    app.jobId && typeof app.jobId === 'object' && '_id' in app.jobId
      ? (app.jobId as unknown as Record<string, unknown> & { _id: mongoose.Types.ObjectId })
      : null;

  return {
    id: app._id.toString(),
    candidateId: app.candidateId.toString(),
    jobId: populatedJob ? populatedJob._id.toString() : String(app.jobId),
    job: populatedJob
      ? {
          id: populatedJob._id.toString(),
          title: populatedJob.title,
          company: populatedJob.company,
          companyDescription: populatedJob.companyDescription,
          location: populatedJob.location,
          employmentType: populatedJob.employmentType,
          workplaceType: populatedJob.workplaceType,
          experienceLevel: populatedJob.experienceLevel,
          category: populatedJob.category,
          salaryRange: populatedJob.salaryRange,
          status: populatedJob.status,
          postedAt: populatedJob.postedAt,
        }
      : null,
    resumeFileId: app.resumeFileId ? app.resumeFileId.toString() : null,
    coverLetter: app.coverLetter,
    status: app.status,
    statusHistory: app.statusHistory,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
  };
}


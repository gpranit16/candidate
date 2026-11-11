import mongoose from 'mongoose';
import { APPLICATION_STATUSES, Application, ApplicationStatus } from '../models/Application';
import { CandidateProfile } from '../models/CandidateProfile';
import { Job } from '../models/Job';
import { AppError } from '../utils/AppError';
import { getResumeBucket, getResumeFileMetadata } from '../utils/gridfs';

export async function getAdminDashboardStats() {
  const [
    totalJobs,
    publishedJobs,
    draftJobs,
    archivedJobs,
    totalApplications,
    statusAggregation,
    recentApplications,
  ] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: 'published' }),
    Job.countDocuments({ status: 'draft' }),
    Job.countDocuments({ status: 'archived' }),
    Application.countDocuments(),
    Application.aggregate<{ _id: ApplicationStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.find()
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title company location status')
      .lean(),
  ]);

  const applicationsByStatus = APPLICATION_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<ApplicationStatus, number>
  );

  for (const row of statusAggregation) {
    if (row._id in applicationsByStatus) {
      applicationsByStatus[row._id] = row.count;
    }
  }

  const recentActivity = recentApplications.map((app) => {
    const candidate =
      app.candidateId && typeof app.candidateId === 'object' && 'name' in app.candidateId
        ? (app.candidateId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string })
        : null;
    const job =
      app.jobId && typeof app.jobId === 'object' && 'title' in app.jobId
        ? (app.jobId as unknown as { _id: mongoose.Types.ObjectId; title: string; company: string; location: string })
        : null;

    return {
      id: app._id.toString(),
      status: app.status,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      candidate: candidate
        ? { id: candidate._id.toString(), name: candidate.name, email: candidate.email }
        : null,
      job: job
        ? { id: job._id.toString(), title: job.title, company: job.company, location: job.location }
        : null,
    };
  });

  return {
    metrics: {
      totalJobs,
      publishedJobs,
      draftJobs,
      archivedJobs,
      totalApplications,
    },
    applicationsByStatus,
    recentActivity,
  };
}

export async function getAdminJobsList(statusFilter?: string) {
  const query: Record<string, unknown> = {};
  if (statusFilter && ['draft', 'published', 'archived'].includes(statusFilter)) {
    query.status = statusFilter;
  }

  const [jobs, appCounts] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).lean(),
    Application.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(appCounts.map((c) => [c._id.toString(), c.count]));

  return jobs.map((job) => ({
    ...job,
    id: job._id.toString(),
    applicationCount: countMap.get(job._id.toString()) || 0,
  }));
}

export async function getAdminApplicationsList(filters: {
  jobId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (filters.jobId && mongoose.Types.ObjectId.isValid(filters.jobId)) {
    query.jobId = new mongoose.Types.ObjectId(filters.jobId);
  }
  if (filters.status && APPLICATION_STATUSES.includes(filters.status as ApplicationStatus)) {
    query.status = filters.status;
  }

  const [applications, total] = await Promise.all([
    Application.find(query)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('candidateId', 'name email')
      .populate('jobId', 'title company location employmentType status')
      .lean(),
    Application.countDocuments(query),
  ]);

  const candidateIds = applications
    .map((a) =>
      a.candidateId && typeof a.candidateId === 'object' && '_id' in a.candidateId
        ? (a.candidateId as unknown as { _id: mongoose.Types.ObjectId })._id
        : null
    )
    .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

  const profiles = await CandidateProfile.find({ userId: { $in: candidateIds } }).lean();
  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

  const items = await Promise.all(
    applications.map(async (app) => {
      const candidate =
        app.candidateId && typeof app.candidateId === 'object' && 'name' in app.candidateId
          ? (app.candidateId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string })
          : null;
      const job =
        app.jobId && typeof app.jobId === 'object' && 'title' in app.jobId
          ? (app.jobId as unknown as {
              _id: mongoose.Types.ObjectId;
              title: string;
              company: string;
              location: string;
              employmentType: string;
              status: string;
            })
          : null;

      const profile = candidate ? profileMap.get(candidate._id.toString()) : null;
      const resumeId = app.resumeFileId || profile?.resumeFileId || null;
      const resumeMeta = resumeId ? await getResumeFileMetadata(resumeId) : null;

      return {
        id: app._id.toString(),
        status: app.status,
        coverLetter: app.coverLetter,
        statusHistory: app.statusHistory,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        candidate: candidate
          ? {
              id: candidate._id.toString(),
              name: candidate.name,
              email: candidate.email,
              profile: profile
                ? {
                    phone: profile.phone,
                    location: profile.location,
                    headline: profile.headline,
                    bio: profile.bio,
                    skills: profile.skills,
                    education: profile.education,
                    experience: profile.experience,
                    profileCompletion: profile.profileCompletion,
                  }
                : null,
            }
          : null,
        job: job
          ? {
              id: job._id.toString(),
              title: job.title,
              company: job.company,
              location: job.location,
              employmentType: job.employmentType,
              status: job.status,
            }
          : null,
        resume: resumeMeta,
      };
    })
  );

  return {
    applications: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function updateApplicationStatusByAdmin(
  applicationId: string,
  adminUserId: string,
  input: { status: ApplicationStatus; note?: string }
) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new AppError('Invalid application identifier.', 400, 'INVALID_APPLICATION_ID');
  }

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError('Application not found.', 404, 'APPLICATION_NOT_FOUND');
  }

  application.status = input.status;
  application.statusHistory.push({
    status: input.status,
    changedAt: new Date(),
    note: input.note?.trim() || `Status updated to ${input.status}.`,
    changedBy: new mongoose.Types.ObjectId(adminUserId),
  });

  await application.save();
  return application.toJSON();
}

export async function getAdminResumeDownload(fileId: string) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    throw new AppError('Invalid file identifier.', 400, 'INVALID_FILE_ID');
  }

  const meta = await getResumeFileMetadata(fileId);
  if (!meta) {
    throw new AppError('Resume file not found.', 404, 'RESUME_NOT_FOUND');
  }

  const bucket = getResumeBucket();
  const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  return { meta, stream };
}


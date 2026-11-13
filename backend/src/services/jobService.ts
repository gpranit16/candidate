import mongoose, { FilterQuery } from 'mongoose';
import { IJob, Job } from '../models/Job';
import { Application } from '../models/Application';
import { AppError } from '../utils/AppError';

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface JobSearchFilters {
  q?: string;
  search?: string;
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  experienceLevel?: string;
  category?: string;
  minSalary?: number;
  maxSalary?: number;
  sort?: 'newest' | 'relevance';
  page?: number;
  limit?: number;
}

export async function listPublishedJobs(filters: JobSearchFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 9));
  const skip = (page - 1) * limit;

  const query: FilterQuery<IJob> = { status: 'published' };
  const keyword = (filters.q || filters.search || '').trim();

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), 'i');
    query.$or = [
      { title: regex },
      { company: regex },
      { description: regex },
      { category: regex },
      { skills: regex },
    ];
  }

  if (filters.location && filters.location.trim()) {
    query.location = new RegExp(escapeRegex(filters.location.trim()), 'i');
  }

  if (filters.employmentType) {
    query.employmentType = filters.employmentType;
  }

  if (filters.workplaceType) {
    query.workplaceType = filters.workplaceType;
  }

  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }

  if (filters.category && filters.category.trim()) {
    query.category = new RegExp(`^${escapeRegex(filters.category.trim())}$`, 'i');
  }

  if (filters.minSalary !== undefined || filters.maxSalary !== undefined) {
    query['salaryRange.isDisclosed'] = true;
    if (filters.minSalary !== undefined) {
      query['salaryRange.max'] = { $gte: filters.minSalary };
    }
    if (filters.maxSalary !== undefined) {
      query['salaryRange.min'] = { $lte: filters.maxSalary };
    }
  }

  const sortStage: Record<string, 1 | -1> = { postedAt: -1, createdAt: -1 };
  if (filters.sort === 'relevance' && keyword) {
    // When sorting by relevance with a keyword, fetch matching candidates and rank by title/skills match weight,
    // or use MongoDB text search when possible. Here regex + deterministic relevance scoring handles partial words cleanly.
    const allMatches = await Job.find(query).lean();
    const lowerKw = keyword.toLowerCase();
    const scored = allMatches
      .map((job) => {
        let score = 0;
        if (job.title.toLowerCase().includes(lowerKw)) score += 10;
        if (job.skills && Array.isArray(job.skills) && job.skills.some((s: string) => s.toLowerCase().includes(lowerKw))) score += 6;
        if (job.company.toLowerCase().includes(lowerKw)) score += 5;
        if (job.category.toLowerCase().includes(lowerKw)) score += 4;
        if (job.description.toLowerCase().includes(lowerKw)) score += 1;
        return { job, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aTime = a.job.postedAt ? new Date(a.job.postedAt).getTime() : 0;
        const bTime = b.job.postedAt ? new Date(b.job.postedAt).getTime() : 0;
        return bTime - aTime;
      });

    const total = scored.length;
    const paged = scored.slice(skip, skip + limit).map((item) => ({
      ...item.job,
      id: item.job._id.toString(),
    }));

    return {
      jobs: paged,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  const [jobs, total, categories] = await Promise.all([
    Job.find(query).sort(sortStage).skip(skip).limit(limit),
    Job.countDocuments(query),
    Job.distinct('category', { status: 'published' }),
  ]);

  return {
    jobs: jobs.map((j) => j.toJSON()),
    categories: categories.sort(),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getJobDetails(jobId: string, viewer?: { id: string; role: string }) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid job identifier.', 400, 'INVALID_JOB_ID');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job listing not found.', 404, 'JOB_NOT_FOUND');
  }

  if (job.status !== 'published' && viewer?.role !== 'admin') {
    throw new AppError('This job listing is no longer available.', 404, 'JOB_UNAVAILABLE');
  }

  let existingApplication: { id: string; status: string; appliedAt: Date } | null = null;
  if (viewer?.id) {
    const app = await Application.findOne({
      candidateId: viewer.id,
      jobId: job._id,
    }).lean();
    if (app) {
      existingApplication = {
        id: app._id.toString(),
        status: app.status,
        appliedAt: app.appliedAt,
      };
    }
  }

  return {
    job: job.toJSON(),
    hasApplied: Boolean(existingApplication),
    application: existingApplication,
  };
}

export async function createJob(input: Record<string, unknown>) {
  const status = (input.status as string) || 'draft';
  const postedAt = status === 'published' ? new Date() : null;

  const job = await Job.create({
    ...input,
    postedAt,
  });

  return job.toJSON();
}

export async function updateJob(jobId: string, input: Record<string, unknown>) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid job identifier.', 400, 'INVALID_JOB_ID');
  }

  const existing = await Job.findById(jobId);
  if (!existing) {
    throw new AppError('Job listing not found.', 404, 'JOB_NOT_FOUND');
  }

  if (input.status === 'published' && !existing.postedAt) {
    existing.postedAt = new Date();
  }

  Object.assign(existing, input);
  await existing.save();

  return existing.toJSON();
}

export async function deleteOrArchiveJob(jobId: string, hardDelete = false) {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new AppError('Invalid job identifier.', 400, 'INVALID_JOB_ID');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job listing not found.', 404, 'JOB_NOT_FOUND');
  }

  const appCount = await Application.countDocuments({ jobId: job._id });

  if (hardDelete && appCount === 0) {
    await job.deleteOne();
    return { action: 'deleted', id: jobId };
  }

  // Safe archival rule: preserve referential integrity when applications exist or by default
  job.status = 'archived';
  await job.save();
  return { action: 'archived', job: job.toJSON() };
}

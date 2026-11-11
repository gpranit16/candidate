import { Request, Response } from 'express';
import * as jobService from '../services/jobService';
import { asyncHandler } from '../utils/asyncHandler';

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const data = await jobService.listPublishedJobs(req.query as unknown as jobService.JobSearchFilters);
  res.status(200).json({
    success: true,
    data,
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const data = await jobService.getJobDetails(String(req.params.id), req.user);
  res.status(200).json({
    success: true,
    data,
  });
});

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.createJob(req.body);
  res.status(201).json({
    success: true,
    data: { job },
  });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.updateJob(String(req.params.id), req.body);
  res.status(200).json({
    success: true,
    data: { job },
  });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const hardDelete = req.query.hard === 'true';
  const result = await jobService.deleteOrArchiveJob(String(req.params.id), hardDelete);
  res.status(200).json({
    success: true,
    data: result,
  });
});

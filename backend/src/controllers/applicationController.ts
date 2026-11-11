import { Request, Response } from 'express';
import * as applicationService from '../services/applicationService';
import { asyncHandler } from '../utils/asyncHandler';

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.submitApplication(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: { application },
  });
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await applicationService.getCandidateApplications(req.user!.id);
  res.status(200).json({
    success: true,
    data: { applications },
  });
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getCandidateApplicationById(String(req.params.id), {
    id: req.user!.id,
    role: req.user!.role,
  });
  res.status(200).json({
    success: true,
    data: { application },
  });
});

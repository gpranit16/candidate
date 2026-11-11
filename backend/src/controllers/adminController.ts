import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getAdminDashboardStats();
  res.status(200).json({
    success: true,
    data,
  });
});

export const getAdminJobs = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const jobs = await adminService.getAdminJobsList(status);
  res.status(200).json({
    success: true,
    data: { jobs },
  });
});

export const getAdminApplications = asyncHandler(async (req: Request, res: Response) => {
  const data = await adminService.getAdminApplicationsList({
    jobId: typeof req.query.jobId === 'string' ? req.query.jobId : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const application = await adminService.updateApplicationStatusByAdmin(
    String(req.params.id),
    req.user!.id,
    req.body
  );
  res.status(200).json({
    success: true,
    data: { application },
  });
});

export const downloadCandidateResume = asyncHandler(async (req: Request, res: Response) => {
  const { meta, stream } = await adminService.getAdminResumeDownload(String(req.params.fileId));
  res.setHeader('Content-Type', meta.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.filename)}"`);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: { code: 'STREAM_ERROR', message: 'Failed to read resume file.' },
      });
    }
  });
  stream.pipe(res);
});

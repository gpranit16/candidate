import { Request, Response } from 'express';
import * as profileService from '../services/profileService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await profileService.getCandidateProfile(req.user!.id);
  res.status(200).json({
    success: true,
    data,
  });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = await profileService.updateCandidateProfile(req.user!.id, req.body);
  res.status(200).json({
    success: true,
    data,
  });
});

export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Please select a PDF, DOC, or DOCX file to upload.', 400, 'FILE_REQUIRED');
  }

  const data = await profileService.uploadCandidateResume(req.user!.id, req.file);
  res.status(200).json({
    success: true,
    data,
  });
});

export const downloadResume = asyncHandler(async (req: Request, res: Response) => {
  const { meta, stream } = await profileService.getCandidateResumeDownload(req.user!.id);

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


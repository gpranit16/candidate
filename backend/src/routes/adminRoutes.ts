import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateApplicationStatusSchema } from '../validators/applicationValidator';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/jobs', adminController.getAdminJobs);
router.get('/applications', adminController.getAdminApplications);
router.patch(
  '/applications/:id/status',
  validateBody(updateApplicationStatusSchema),
  adminController.updateApplicationStatus
);
router.get('/resumes/:fileId', adminController.downloadCandidateResume);

export default router;


import { Router } from 'express';
import * as jobController from '../controllers/jobController';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createJobSchema, jobQuerySchema, updateJobSchema } from '../validators/jobValidator';

const router = Router();

router.get('/', validateQuery(jobQuerySchema), jobController.getJobs);
router.get('/:id', optionalAuth, jobController.getJobById);

router.post('/', requireAuth, requireAdmin, validateBody(createJobSchema), jobController.createJob);
router.put('/:id', requireAuth, requireAdmin, validateBody(updateJobSchema), jobController.updateJob);
router.delete('/:id', requireAuth, requireAdmin, jobController.deleteJob);

export default router;


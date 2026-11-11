import { Router } from 'express';
import * as applicationController from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createApplicationSchema } from '../validators/applicationValidator';

const router = Router();

router.use(requireAuth);

router.post('/', validateBody(createApplicationSchema), applicationController.createApplication);
router.get('/me', applicationController.getMyApplications);
router.get('/:id', applicationController.getApplicationById);

export default router;


import { Router } from 'express';
import { ConsentController } from './consent.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new ConsentController();

router.post('/', authMiddleware, controller.recordConsent);
router.get('/history', authMiddleware, controller.getHistory);

export default router;

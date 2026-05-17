import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import consentRoutes from '../modules/consent/consent.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/consent', consentRoutes);

export default router;
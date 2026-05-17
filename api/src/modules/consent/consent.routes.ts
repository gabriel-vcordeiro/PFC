import { Router } from 'express';
import { ConsentController } from './consent.controller';

const router = Router();
const controller = new ConsentController();

router.post('/', controller.recordConsent);
router.get('/history', controller.getHistory);

export default router;

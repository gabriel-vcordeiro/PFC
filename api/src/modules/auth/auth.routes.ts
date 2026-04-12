import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/verify-2fa', controller.verify2FA);
router.post('/enable-2fa', controller.enable2FA);
router.post('/disable-2fa', controller.disable2FA);

export default router;
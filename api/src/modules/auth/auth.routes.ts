import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/verify-2fa', controller.verify2FA);
router.post('/enable-2fa', authMiddleware, controller.enable2FA);
router.post('/disable-2fa', authMiddleware, controller.disable2FA);

router.post('/request-password-reset', controller.requestPasswordReset);
router.post('/validate-reset-token', controller.validateResetToken);
router.post('/reset-password', controller.resetPassword);

export default router;

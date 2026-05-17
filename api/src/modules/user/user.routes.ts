import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

const controller = new UserController();

router.get('/user', authMiddleware, controller.getUserData);
router.get('/export-user-data', authMiddleware, controller.exportUserData);
router.post('/delete-user-data', authMiddleware, controller.deleteUserData);

export default router;
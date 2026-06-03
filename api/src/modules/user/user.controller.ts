import { Request, Response } from 'express';
import { UserService } from './user.service';
let userService = new UserService();
export class UserController {
  async getUserData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const user = await userService.getUserData(userId);
      return res.json(user);
    } catch (err: any) {
      return res.status(401).json({
        error: err.message,
      });
    }
  }

  async deleteUserData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await userService.deleteUserData(userId, ipAddress, userAgent);

      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }

  async exportUserData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await userService.exportUserData(userId, ipAddress, userAgent);

      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }
}

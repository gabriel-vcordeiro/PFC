import { Request, Response } from 'express';
import { verifyToken } from '../../utils/jwt';
import { UserService } from './user.service';
type DecodedAuthToken = {
  userId?: string;
};
let userService = new UserService();
export class UserController {
  async getUserData(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const token = authHeader.split(' ')[1];
      const validatedToken = verifyToken(token!) as DecodedAuthToken;

      if (!validatedToken?.userId) {
        return res.status(401).json({
          error: 'Token inválido.',
        });
      }
      const user = await userService.getUserData(validatedToken.userId);
      return res.json(user);
    } catch (err: any) {
      return res.status(401).json({
        error: err.message,
      });
    }
  }

  async deleteUserData(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const token = authHeader.split(' ')[1];
      const validatedToken = verifyToken(token!) as DecodedAuthToken;

      if (!validatedToken?.userId) {
        return res.status(401).json({
          error: 'Token inválido.',
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await userService.deleteUserData(validatedToken.userId, ipAddress, userAgent);

      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }

  async exportUserData(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Token necessário.',
        });
      }

      const token = authHeader.split(' ')[1];
      const validatedToken = verifyToken(token!) as DecodedAuthToken;

      if (!validatedToken?.userId) {
        return res.status(401).json({
          error: 'Token inválido.',
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await userService.exportUserData(validatedToken.userId, ipAddress, userAgent);

      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({
        error: err.message,
      });
    }
  }
}

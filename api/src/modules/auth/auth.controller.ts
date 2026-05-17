import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginSchema, RegisterSchema } from './auth.dto';
import { User } from '../../models/user';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }
      const { email, password, username } = parsed.data;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const user: User = {
        id: '',
        email,
        password,
        username,
        is2FAEnabled: false,
        twoFASecret: null,
      };
      const userResponse = await authService.register(user, ipAddress, userAgent);

      res.status(201).json(userResponse);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }
      const { email, password } = parsed.data;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const result = await authService.login(email, password, ipAddress, userAgent);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async verify2FA(req: Request, res: Response) {
    try {
      const { userId, token } = req.body;
      if (!userId || !token) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }
      const result = await authService.verify2FA(userId, token);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

  async enable2FA(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID necessário.' });
      }
      const result = await authService.enable2FA(userId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async disable2FA(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'User ID necessário.' });
      }
      await authService.disable2FA(userId);
      res.json({ message: '2FA desabilitado.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email necessário.' });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await authService.requestPasswordReset(email, ipAddress, userAgent);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
  async validateResetToken(req: Request, res: Response) {
    try {
      const { resetToken } = req.body;
      if (!resetToken) {
        return res.status(400).json({ error: 'Token necessário.' });
      }

      const user = await authService.validateResetToken(resetToken);
      res.json({ valid: true, email: user.email });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) {
        return res.status(400).json({ error: 'Token e nova senha necessários.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres.' });
      }

      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await authService.resetPassword(resetToken, newPassword, ipAddress, userAgent);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}


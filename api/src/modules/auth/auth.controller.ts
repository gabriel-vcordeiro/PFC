import { Request, Response } from 'express';
import { AuthService } from "./auth.services";
import { RegisterSchema } from './auth.dto';

const authService = new AuthService();

export class AuthController {

  async register(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);

      if (!parsed.success) {
       return res.status(400).json({ error: 'Dados inválidos.' });
      }
      const { email, password } = parsed.data;

      const user = await authService.register(email, password);

      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
       return res.status(400).json({ error: 'Dados inválidos.' });
      }
      const { email, password } = parsed.data;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }
}
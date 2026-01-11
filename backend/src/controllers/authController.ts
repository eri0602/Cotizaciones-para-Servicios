import { Response, NextFunction } from 'express';
import { AuthRequest, authenticate } from '../middleware/authMiddleware';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verificado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

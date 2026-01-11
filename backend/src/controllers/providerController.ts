import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { providerService } from '../services/providerService';

export class ProviderController {
  async createProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.createProfile(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.updateProfile(req.user!.userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.getProfile(req.params.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.searchProviders(req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPortfolioItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.addPortfolioItem(req.user!.userId, req.body, req.body.imageUrl);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePortfolioItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await providerService.deletePortfolioItem(req.user!.userId, req.params.id);

      res.json({
        success: true,
        message: 'Item eliminado',
      });
    } catch (error) {
      next(error);
    }
  }

  async addCertification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await providerService.addCertification(req.user!.userId, req.body, req.body.certificateUrl);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const providerController = new ProviderController();

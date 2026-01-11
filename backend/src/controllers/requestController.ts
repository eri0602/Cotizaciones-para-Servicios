import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { requestService } from '../services/requestService';

export class RequestController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await requestService.createRequest(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await requestService.getRequests(req.query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await requestService.getRequestById(req.params.id, req.user?.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await requestService.getMyRequests(req.user!.userId, req.query.status as string);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await requestService.updateRequest(req.params.id, req.user!.userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await requestService.deleteRequest(req.params.id, req.user!.userId);

      res.json({
        success: true,
        message: 'Solicitud eliminada',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();

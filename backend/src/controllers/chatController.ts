import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { chatService } from '../services/chatService';

export class ChatController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await chatService.getConversations(req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await chatService.getMessages(req.params.id, req.user!.userId, page);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await chatService.sendMessage(req.params.id, req.user!.userId, req.body.message);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await chatService.markAsRead(req.params.id, req.user!.userId);

      res.json({
        success: true,
        message: 'Mensajes marcados como leídos',
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { requestId, providerId } = req.body;
      const result = await chatService.getOrCreateConversation(requestId, providerId, req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();

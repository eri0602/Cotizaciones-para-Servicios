import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../config/database';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { profile: true, providerProfile: true },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, phone, address, city, state, avatarUrl } = req.body;

      const profile = await prisma.userProfile.upsert({
        where: { userId: req.user!.userId },
        create: {
          userId: req.user!.userId,
          firstName: firstName || '',
          lastName: lastName || '',
          phone,
          address,
          city,
          state,
          avatarUrl,
        },
        update: {
          firstName,
          lastName,
          phone,
          address,
          city,
          state,
          ...(avatarUrl && { avatarUrl }),
        },
      });

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { unreadOnly, page = 1, limit = 20 } = req.query;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: {
            userId: req.user!.userId,
            ...(unreadOnly === 'true' && { isRead: false }),
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.notification.count({ where: { userId: req.user!.userId } }),
        prisma.notification.count({ where: { userId: req.user!.userId, isRead: false } }),
      ]);

      res.json({
        success: true,
        data: {
          notifications,
          total,
          unreadCount,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true },
      });

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

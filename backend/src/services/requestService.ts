import { prisma } from '../config/database';
import { CustomError, NotFoundError } from '../utils/errors';

export class RequestService {
  async createRequest(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.role !== 'CLIENT') {
      throw new CustomError('Solo los clientes pueden crear solicitudes', 403);
    }

    const request = await prisma.request.create({
      data: {
        clientId: userId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        urgency: data.urgency,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || 'Peru',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { category: true },
    });

    return request;
  }

  async getRequests(query: any) {
    const { category, city, status, urgency, budgetMin, budgetMax, page = 1, limit = 20 } = query;

    const where: any = { status: 'OPEN' };

    if (category) where.categoryId = category;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (urgency) where.urgency = urgency;
    if (budgetMin || budgetMax) {
      where.budgetMin = budgetMin ? { gte: parseFloat(budgetMin) } : undefined;
      where.budgetMax = budgetMax ? { lte: parseFloat(budgetMax) } : undefined;
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          category: true,
          images: { take: 1 },
          client: { include: { profile: true } },
          _count: { select: { proposals: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return { requests, total, page, pages: Math.ceil(total / limit) };
  }

  async getRequestById(id: string, userId?: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        client: { include: { profile: true } },
        proposals: {
          include: { provider: { include: { user: { include: { profile: true } } } } },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Solicitud');
    }

    if (userId) {
      await prisma.request.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });
    }

    return request;
  }

  async getMyRequests(userId: string, status?: string) {
    return prisma.request.findMany({
      where: {
        clientId: userId,
        ...(status && { status: status as any }),
      },
      include: {
        category: true,
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequest(id: string, userId: string, data: any) {
    const request = await prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundError('Solicitud');
    }

    if (request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.request.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : null,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        urgency: data.urgency,
      },
    });
  }

  async deleteRequest(id: string, userId: string) {
    const request = await prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundError('Solicitud');
    }

    if (request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.request.delete({ where: { id } });
  }
}

export const requestService = new RequestService();

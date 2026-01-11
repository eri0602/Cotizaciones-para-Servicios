import { prisma } from '../config/database';
import { CustomError, NotFoundError } from '../utils/errors';

export class ProposalService {
  async createProposal(userId: string, data: { requestId: string; price: number; estimatedDays?: number; message: string }) {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!provider || !provider.user.isVerified) {
      throw new CustomError('Debes completar tu perfil de proveedor primero', 403);
    }

    const request = await prisma.request.findUnique({
      where: { id: data.requestId },
      include: { client: true },
    });

    if (!request) {
      throw new NotFoundError('Solicitud');
    }

    if (request.status !== 'OPEN') {
      throw new CustomError('Esta solicitud ya no acepta propuestas', 400);
    }

    const existingProposal = await prisma.requestProposal.findUnique({
      where: { requestId_providerId: { requestId: data.requestId, providerId: provider.id } },
    });

    if (existingProposal) {
      throw new CustomError('Ya has enviado una propuesta para esta solicitud', 400);
    }

    return prisma.requestProposal.create({
      data: {
        requestId: data.requestId,
        providerId: provider.id,
        price: data.price,
        estimatedDays: data.estimatedDays,
        message: data.message,
      },
      include: { provider: true },
    });
  }

  async getMyProposals(userId: string, status?: string) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId } });

    if (!provider) {
      throw new NotFoundError('Perfil de proveedor');
    }

    return prisma.requestProposal.findMany({
      where: {
        providerId: provider.id,
        ...(status && { status: status as any }),
      },
      include: {
        request: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProposal(id: string, userId: string, data: any) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId } });

    const proposal = await prisma.requestProposal.findUnique({ where: { id } });

    if (!proposal) {
      throw new NotFoundError('Propuesta');
    }

    if (proposal.providerId !== provider?.id) {
      throw new CustomError('No autorizado', 403);
    }

    const hoursSinceCreation = (Date.now() - proposal.createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      throw new CustomError('Solo puedes editar propuestas en las primeras 24 horas', 400);
    }

    return prisma.requestProposal.update({
      where: { id },
      data: {
        price: data.price,
        estimatedDays: data.estimatedDays,
        message: data.message,
      },
    });
  }

  async withdrawProposal(id: string, userId: string) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId } });

    const proposal = await prisma.requestProposal.findUnique({ where: { id } });

    if (!proposal) {
      throw new NotFoundError('Propuesta');
    }

    if (proposal.providerId !== provider?.id) {
      throw new CustomError('No autorizado', 403);
    }

    if (proposal.status !== 'PENDING') {
      throw new CustomError('Solo puedes retirar propuestas pendientes', 400);
    }

    return prisma.requestProposal.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });
  }

  async getProposalsForRequest(requestId: string, userId: string) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { client: true },
    });

    if (!request) {
      throw new NotFoundError('Solicitud');
    }

    if (request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.requestProposal.findMany({
      where: { requestId },
      include: {
        provider: {
          include: {
            user: { include: { profile: true } },
            _count: { select: { transactions: true } },
          },
        },
      },
      orderBy: [{ isHighlighted: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async acceptProposal(id: string, userId: string) {
    const proposal = await prisma.requestProposal.findUnique({
      where: { id },
      include: { request: true, provider: { include: { user: true } } },
    });

    if (!proposal) {
      throw new NotFoundError('Propuesta');
    }

    if (proposal.request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    if (proposal.status !== 'PENDING') {
      throw new CustomError('Esta propuesta ya no está disponible', 400);
    }

    const platformFee = Math.max(proposal.price.toNumber() * 0.10, 5);
    const providerEarnings = proposal.price.toNumber() - platformFee;

    return prisma.$transaction(async (tx) => {
      await tx.requestProposal.updateMany({
        where: { requestId: proposal.requestId, id: { not: id } },
        data: { status: 'REJECTED' },
      });

      await tx.requestProposal.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      await tx.request.update({
        where: { id: proposal.requestId },
        data: { status: 'IN_PROGRESS' },
      });

      return tx.transaction.create({
        data: {
          requestId: proposal.requestId,
          proposalId: proposal.id,
          clientId: userId,
          providerId: proposal.providerId,
          amount: proposal.price,
          platformFee,
          providerEarnings,
          currency: 'PEN',
          paymentStatus: 'PENDING',
        },
      });
    });
  }

  async rejectProposal(id: string, userId: string) {
    const proposal = await prisma.requestProposal.findUnique({
      where: { id },
      include: { request: true },
    });

    if (!proposal) {
      throw new NotFoundError('Propuesta');
    }

    if (proposal.request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.requestProposal.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }
}

export const proposalService = new ProposalService();

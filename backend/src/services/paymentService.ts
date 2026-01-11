import Stripe from 'stripe';
import { prisma } from '../config/database';
import { stripe } from '../config/stripe';
import { CustomError, NotFoundError } from '../utils/errors';

export class PaymentService {
  async createPaymentIntent(proposalId: string, userId: string) {
    const proposal = await prisma.requestProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
        provider: { include: { user: true } },
      },
    });

    if (!proposal) {
      throw new NotFoundError('Propuesta');
    }

    if (proposal.request.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    const amount = proposal.price.toNumber();
    const platformFee = Math.max(amount * 0.10, 5);
    const providerEarnings = amount - platformFee;

    const transaction = await prisma.transaction.create({
      data: {
        requestId: proposal.requestId,
        proposalId: proposal.id,
        clientId: userId,
        providerId: proposal.providerId,
        amount,
        platformFee,
        providerEarnings,
        currency: 'PEN',
        paymentStatus: 'PENDING',
      },
    });

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100),
      currency: 'pen',
      metadata: {
        transactionId: transaction.id,
        proposalId: proposal.id,
        requestId: proposal.requestId,
      },
    };

    if (proposal.provider.stripeAccountId) {
      paymentIntentParams.transfer_data = {
        destination: proposal.provider.stripeAccountId,
      };
      paymentIntentParams.application_fee_amount = Math.round(platformFee * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { stripePaymentId: paymentIntent.id },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction.id,
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const transactionId = paymentIntent.metadata.transactionId;

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: 'PAID',
          startedAt: new Date(),
        },
      });

      await tx.requestProposal.update({
        where: { id: paymentIntent.metadata.proposalId },
        data: { status: 'ACCEPTED' },
      });

      await tx.request.update({
        where: { id: paymentIntent.metadata.requestId },
        data: { status: 'IN_PROGRESS' },
      });

      await tx.requestProposal.updateMany({
        where: {
          requestId: paymentIntent.metadata.requestId,
          id: { not: paymentIntent.metadata.proposalId },
        },
        data: { status: 'REJECTED' },
      });
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await prisma.transaction.update({
      where: { stripePaymentId: paymentIntent.id },
      data: { paymentStatus: 'FAILED' },
    });
  }

  async getMyTransactions(userId: string, role?: 'client' | 'provider') {
    const where: any = role === 'provider'
      ? { providerId: userId }
      : { clientId: userId };

    return prisma.transaction.findMany({
      where,
      include: {
        request: { include: { category: true } },
        proposal: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeTransaction(id: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!transaction) {
      throw new NotFoundError('Transacción');
    }

    if (transaction.providerId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.transaction.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }

  async confirmTransaction(id: string, userId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { request: true, provider: true },
    });

    if (!transaction) {
      throw new NotFoundError('Transacción');
    }

    if (transaction.clientId !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: { paymentStatus: 'COMPLETED' },
      });

      await tx.providerProfile.update({
        where: { id: transaction.providerId },
        data: { totalJobsCompleted: { increment: 1 } },
      });

      return updated;
    });
  }
}

export const paymentService = new PaymentService();

import { prisma } from '../config/database';
import { CustomError, NotFoundError } from '../utils/errors';

export class ChatService {
  async getConversations(userId: string) {
    return prisma.chatConversation.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: { include: { profile: true, providerProfile: true } },
        participant2: { include: { profile: true, providerProfile: true } },
        request: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError('Conversación');
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new CustomError('No autorizado', 403);
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        include: { sender: { select: { id: true, email: true, profile: true, providerProfile: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return {
      messages: messages.reverse(),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async sendMessage(conversationId: string, senderId: string, message: string) {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundError('Conversación');
    }

    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      throw new CustomError('No autorizado', 403);
    }

    if (this.moderateMessage(message)) {
      throw new CustomError('El mensaje contiene información de contacto no permitida', 400);
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        message,
      },
      include: { sender: { select: { id: true, email: true, profile: true } } },
    });

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return newMessage;
  }

  async getOrCreateConversation(requestId: string, providerId: string, clientId: string) {
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        requestId,
        OR: [
          { participant1Id: clientId, participant2Id: providerId },
          { participant1Id: providerId, participant2Id: clientId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          requestId,
          participant1Id: clientId,
          participant2Id: providerId,
        },
      });
    }

    return conversation;
  }

  async markAsRead(conversationId: string, userId: string) {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  private moderateMessage(message: string): boolean {
    const blockedPatterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      /whatsapp|telegram|facebook|instagram/gi,
    ];

    return blockedPatterns.some(pattern => pattern.test(message));
  }
}

export const chatService = new ChatService();

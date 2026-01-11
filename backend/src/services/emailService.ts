import nodemailer from 'nodemailer';
import { prisma } from '../config/database';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"Cotizaciones" <noreply@cotizaciones.com>',
      to: email,
      subject: 'Verifica tu cuenta',
      html: `
        <h1>Bienvenido a Cotizaciones</h1>
        <p>Por favor verifica tu cuenta haciendo click en el siguiente enlace:</p>
        <a href="${verificationUrl}">Verificar Email</a>
        <p>Este enlace expirará en 24 horas.</p>
      `,
    });
  }

  async sendNewProposalEmail(userId: string, proposal: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await this.transporter.sendMail({
      from: '"Cotizaciones" <noreply@cotizaciones.com>',
      to: user.email,
      subject: 'Nueva propuesta recibida',
      html: `
        <h2>Tienes una nueva propuesta</h2>
        <p><strong>De:</strong> ${proposal.provider.businessName}</p>
        <p><strong>Precio:</strong> S/. ${proposal.price}</p>
        <a href="${process.env.FRONTEND_URL}/requests/${proposal.requestId}">Ver propuesta</a>
      `,
    });
  }

  async sendProposalAcceptedEmail(userId: string, proposal: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await this.transporter.sendMail({
      from: '"Cotizaciones" <noreply@cotizaciones.com>',
      to: user.email,
      subject: '¡Tu propuesta fue aceptada!',
      html: `
        <h2>¡Felicidades!</h2>
        <p>Tu propuesta para "${proposal.request.title}" ha sido aceptada.</p>
        <a href="${process.env.FRONTEND_URL}/transactions">Ver detalles</a>
      `,
    });
  }

  async sendPaymentSuccessEmail(userId: string, transaction: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await this.transporter.sendMail({
      from: '"Cotizaciones" <noreply@cotizaciones.com>',
      to: user.email,
      subject: 'Pago confirmado - Puedes comenzar',
      html: `
        <h2>¡Pago confirmado!</h2>
        <p>Tu pago ha sido procesado exitosamente.</p>
        <p>Ahora puedes contactar con el proveedor para coordinar el trabajo.</p>
        <a href="${process.env.FRONTEND_URL}/transactions/${transaction.id}">Ver detalles</a>
      `,
    });
  }
}

export const emailService = new EmailService();

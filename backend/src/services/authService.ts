import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { CustomError } from '../utils/errors';

export class AuthService {
  async register(data: { email: string; password: string; role: 'CLIENT' | 'PROVIDER'; phone?: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      throw new CustomError('El email ya está registrado', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        phone: data.phone,
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, providerProfile: true },
    });

    if (!user) {
      throw new CustomError('Credenciales inválidas', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new CustomError('Credenciales inválidas', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        throw new CustomError('Usuario no encontrado', 404);
      }

      const accessToken = this.generateAccessToken(user.id, user.role);
      const refreshToken = this.generateRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch {
      throw new CustomError('Token inválido', 401);
    }
  }

  private generateAccessToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService();

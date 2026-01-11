import { prisma } from '../config/database';
import { CustomError, NotFoundError } from '../utils/errors';

export class ProviderService {
  async createProfile(userId: string, data: any) {
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return this.updateProfile(userId, data);
    }

    return prisma.providerProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        description: data.description,
        yearsExperience: data.yearsExperience,
        city: data.city,
        state: data.state,
        serviceRadius: data.serviceRadius || 50,
        servicesOffered: {
          create: data.categoryIds.map((catId: string) => ({
            categoryId: catId,
          })),
        },
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Perfil de proveedor');
    }

    if (data.categoryIds) {
      await prisma.serviceOffered.deleteMany({
        where: { providerId: profile.id },
      });

      await prisma.serviceOffered.createMany({
        data: data.categoryIds.map((catId: string) => ({
          providerId: profile.id,
          categoryId: catId,
        })),
      });
    }

    return prisma.providerProfile.update({
      where: { userId },
      data: {
        businessName: data.businessName,
        description: data.description,
        yearsExperience: data.yearsExperience,
        city: data.city,
        state: data.state,
        serviceRadius: data.serviceRadius,
      },
    });
  }

  async getProfile(id: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        servicesOffered: { include: { category: true } },
        portfolioItems: { orderBy: { displayOrder: 'asc' } },
        certifications: true,
      },
    });

    if (!profile) {
      throw new NotFoundError('Proveedor');
    }

    return profile;
  }

  async searchProviders(query: any) {
    const { category, city, minRating, sortBy = 'rating', page = 1, limit = 20 } = query;

    const where: any = {
      user: { isActive: true, isVerified: true },
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (minRating) {
      where.ratingAverage = { gte: parseFloat(minRating) };
    }

    if (category) {
      where.servicesOffered = { some: { categoryId: category } };
    }

    const orderBy: any = sortBy === 'rating'
      ? { ratingAverage: 'desc' }
      : sortBy === 'reviews'
      ? { totalReviews: 'desc' }
      : { totalJobsCompleted: 'desc' };

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        include: {
          user: { include: { profile: true } },
          servicesOffered: { include: { category: true } },
          _count: { select: { portfolioItems: true, certifications: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return { providers, total, page, pages: Math.ceil(total / limit) };
  }

  async addPortfolioItem(userId: string, data: any, imageUrl: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundError('Perfil de proveedor');
    }

    return prisma.portfolioItem.create({
      data: {
        providerId: profile.id,
        title: data.title,
        description: data.description,
        imageUrl,
        categoryId: data.categoryId,
      },
    });
  }

  async deletePortfolioItem(userId: string, itemId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });

    const item = await prisma.portfolioItem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundError('Item de portfolio');
    }

    if (item.providerId !== profile?.id) {
      throw new CustomError('No autorizado', 403);
    }

    return prisma.portfolioItem.delete({ where: { id: itemId } });
  }

  async addCertification(userId: string, data: any, certificateUrl?: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });

    if (!profile) {
      throw new NotFoundError('Perfil de proveedor');
    }

    return prisma.certification.create({
      data: {
        providerId: profile.id,
        name: data.name,
        issuer: data.issuer,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        certificateUrl,
      },
    });
  }
}

export const providerService = new ProviderService();

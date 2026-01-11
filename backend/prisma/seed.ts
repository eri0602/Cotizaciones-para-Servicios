import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'plomeria' },
      update: {},
      create: { name: 'Plomería', slug: 'plomeria', iconUrl: '🔧' },
    }),
    prisma.category.upsert({
      where: { slug: 'electricidad' },
      update: {},
      create: { name: 'Electricidad', slug: 'electricidad', iconUrl: '⚡' },
    }),
    prisma.category.upsert({
      where: { slug: 'carpinteria' },
      update: {},
      create: { name: 'Carpintería', slug: 'carpinteria', iconUrl: '🪚' },
    }),
    prisma.category.upsert({
      where: { slug: 'pintura' },
      update: {},
      create: { name: 'Pintura', slug: 'pintura', iconUrl: '🎨' },
    }),
    prisma.category.upsert({
      where: { slug: 'limpieza' },
      update: {},
      create: { name: 'Limpieza', slug: 'limpieza', iconUrl: '🧹' },
    }),
    prisma.category.upsert({
      where: { slug: 'gasfiteria' },
      update: {},
      create: { name: 'Gasfitería', slug: 'gasfiteria', iconUrl: '🔥' },
    }),
    prisma.category.upsert({
      where: { slug: 'albañileria' },
      update: {},
      create: { name: 'Albañilería', slug: 'albañileria', iconUrl: '🧱' },
    }),
    prisma.category.upsert({
      where: { slug: 'jardineria' },
      update: {},
      create: { name: 'Jardinería', slug: 'jardineria', iconUrl: '🌳' },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create demo user (client)
  const clientPassword = await bcrypt.hash('password123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      email: 'cliente@demo.com',
      passwordHash: clientPassword,
      role: 'CLIENT',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          city: 'Lima',
          state: 'Miraflores',
        },
      },
    },
  });

  console.log(`✅ Created demo client: ${client.email}`);

  // Create demo provider
  const providerPassword = await bcrypt.hash('password123', 12);
  const provider = await prisma.user.upsert({
    where: { email: 'proveedor@demo.com' },
    update: {},
    create: {
      email: 'proveedor@demo.com',
      passwordHash: providerPassword,
      role: 'PROVIDER',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Carlos',
          lastName: 'García',
          city: 'Lima',
          state: 'San Isidro',
        },
      },
      providerProfile: {
        create: {
          businessName: 'Servicios Generales Carlos',
          description: 'Empresa con más de 15 años de experiencia en servicios del hogar. Especialistas en plomería, electricidad y reparaciones generales.',
          yearsExperience: 15,
          city: 'Lima',
          state: 'San Isidro',
          serviceRadius: 50,
          ratingAverage: 4.8,
          totalReviews: 124,
          totalJobsCompleted: 256,
          responseRate: 98,
        },
      },
    },
  });

  console.log(`✅ Created demo provider: ${provider.email}`);

  // Create a demo request
  const plomeriaCategory = categories[0];
  const demoRequest = await prisma.request.upsert({
    where: { id: 'demo-request-1' },
    update: {},
    create: {
      id: 'demo-request-1',
      clientId: client.id,
      categoryId: plomeriaCategory.id,
      title: 'Instalación de grifería nueva en baño',
      description: 'Necesito instalar una grifería nueva en el baño principal. Ya compré la grifería y solo necesito que la instalen correctamente. El baño está en el segundo piso.',
      budgetMin: 150,
      budgetMax: 300,
      urgency: 'MEDIUM',
      city: 'Lima',
      state: 'Miraflores',
      address: 'Av. Larco 123, Departamento 502',
      status: 'OPEN',
    },
  });

  console.log(`✅ Created demo request: ${demoRequest.title}`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Client: cliente@demo.com / password123');
  console.log('   Provider: proveedor@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned up existing database records');

  // 2. Create demo users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const memberPassword = await bcrypt.hash('Member@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member = await prisma.user.create({
    data: {
      name: 'Team Member',
      email: 'member@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Alex Developer',
      email: 'alex@example.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });
  console.log('👥 Created demo users (Admin & 2 Members)');

  // 3. Create projects
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1);
  
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const project1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Modernize the company homepage and navigation structure.',
      deadline: futureDate,
      status: 'ACTIVE',
      createdById: admin.id,
      // Add admin as member automatically
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id },
          { userId: member2.id }
        ]
      }
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Launch',
      description: 'Prepare marketing materials and app store listings for the v1 release.',
      deadline: pastDate,
      status: 'ACTIVE',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member.id }
        ]
      }
    },
  });
  console.log('📁 Created demo projects and added members');

  // 4. Create tasks
  // Overdue task for member
  await prisma.task.create({
    data: {
      title: 'App Store Screenshots',
      description: 'Design the 5 required screenshots for iOS App Store.',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: pastDate,
      projectId: project2.id,
      assignedToId: member.id,
      createdById: admin.id,
    }
  });

  // Active task for member
  await prisma.task.create({
    data: {
      title: 'Homepage Hero Section',
      description: 'Implement the new React components for the hero section.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: futureDate,
      projectId: project1.id,
      assignedToId: member.id,
      createdById: admin.id,
    }
  });

  // Completed task for member2
  await prisma.task.create({
    data: {
      title: 'Navigation Bar Refactor',
      description: 'Make the navbar sticky and responsive on mobile.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date(),
      projectId: project1.id,
      assignedToId: member2.id,
      createdById: admin.id,
    }
  });

  // Unassigned task
  await prisma.task.create({
    data: {
      title: 'Write API Documentation',
      description: 'Document the new endpoints in Swagger.',
      status: 'PENDING',
      priority: 'LOW',
      dueDate: futureDate,
      projectId: project1.id,
      createdById: admin.id,
    }
  });

  console.log('📋 Created demo tasks');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create an organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
    },
  });

  console.log('Created organization:', organization);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      organizationId: organization.id,
    },
  });

  console.log('Created admin user:', admin);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: Role.MANAGER,
      organizationId: organization.id,
    },
  });

  console.log('Created manager user:', manager);

  // Create teams
  const developmentTeam = await prisma.team.create({
    data: {
      name: 'Development Team',
      organizationId: organization.id,
    },
  });

  const marketingTeam = await prisma.team.create({
    data: {
      name: 'Marketing Team',
      organizationId: organization.id,
    },
  });

  console.log('Created teams:', developmentTeam, marketingTeam);

  // Create employee users
  const employeePassword = await bcrypt.hash('employee123', 10);
  
  const employee1 = await prisma.user.create({
    data: {
      email: 'dev1@demo.com',
      password: employeePassword,
      firstName: 'Developer',
      lastName: 'One',
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      managerId: manager.id,
      teamId: developmentTeam.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'dev2@demo.com',
      password: employeePassword,
      firstName: 'Developer',
      lastName: 'Two',
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      managerId: manager.id,
      teamId: developmentTeam.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: 'marketing1@demo.com',
      password: employeePassword,
      firstName: 'Marketing',
      lastName: 'One',
      role: Role.EMPLOYEE,
      organizationId: organization.id,
      managerId: manager.id,
      teamId: marketingTeam.id,
    },
  });

  console.log('Created employees:', employee1, employee2, employee3);

  // Create some leave requests
  const now = new Date();
  
  const leave1 = await prisma.leave.create({
    data: {
      userId: employee1.id,
      approverId: manager.id,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      type: 'ANNUAL',
      reason: 'Vacation',
      status: 'APPROVED',
      reviewedBy: manager.id,
    },
  });

  const leave2 = await prisma.leave.create({
    data: {
      userId: employee2.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8),
      type: 'SICK',
      reason: 'Doctor appointment',
      status: 'PENDING',
    },
  });

  console.log('Created leaves:', leave1, leave2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
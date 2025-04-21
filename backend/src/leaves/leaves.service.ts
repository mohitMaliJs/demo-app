import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, UpdateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';
import { LeaveStatus, Role } from '@prisma/client';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaveDto: CreateLeaveDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate dates
    const startDate = new Date(createLeaveDto.startDate);
    const endDate = new Date(createLeaveDto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Cannot request leave for past dates');
    }

    return this.prisma.leave.create({
      data: {
        ...createLeaveDto,
        startDate,
        endDate,
        status: LeaveStatus.PENDING,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, role: Role, organizationId: string) {
    // If user is an employee, return only their leaves
    if (role === Role.EMPLOYEE) {
      return this.prisma.leave.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If user is a manager, return their leaves and leaves of their employees
    if (role === Role.MANAGER) {
      const employees = await this.prisma.user.findMany({
        where: { managerId: userId },
        select: { id: true },
      });

      const employeeIds = employees.map((emp) => emp.id);

      return this.prisma.leave.findMany({
        where: {
          OR: [
            { userId },
            { userId: { in: employeeIds } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If user is an admin, return all leaves in the organization
    return this.prisma.leave.findMany({
      where: {},
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: Role) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            managerId: true,
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Check if user has permission to view this leave
    if (role === Role.EMPLOYEE && leave.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this leave');
    }

    if (role === Role.MANAGER && leave.userId !== userId) {
      // Check if the leave belongs to one of the manager's employees
      const isManager = leave.user.managerId === userId;
      if (!isManager) {
        throw new ForbiddenException('You do not have permission to view this leave');
      }
    }

    return leave;
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto, userId: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Only the leave owner can update it
    if (leave.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this leave');
    }

    // Cannot update if leave is already approved or rejected
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot update leave that is already approved or rejected');
    }

    // Validate dates if provided
    if (updateLeaveDto.startDate && updateLeaveDto.endDate) {
      const startDate = new Date(updateLeaveDto.startDate);
      const endDate = new Date(updateLeaveDto.endDate);

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Cannot request leave for past dates');
      }
    } else if (updateLeaveDto.startDate) {
      const startDate = new Date(updateLeaveDto.startDate);
      const endDate = leave.endDate;

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (startDate < new Date()) {
        throw new BadRequestException('Cannot request leave for past dates');
      }
    } else if (updateLeaveDto.endDate) {
      const startDate = leave.startDate;
      const endDate = new Date(updateLeaveDto.endDate);

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    return this.prisma.leave.update({
      where: { id },
      data: updateLeaveDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, updateLeaveStatusDto: UpdateLeaveStatusDto, userId: string, role: Role) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            managerId: true,
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Check if user has permission to update status
    if (role === Role.EMPLOYEE) {
      throw new ForbiddenException('Employees cannot approve or reject leaves');
    }

    if (role === Role.MANAGER) {
      // Managers can only update status for their employees
      if (leave.user.managerId !== userId) {
        throw new ForbiddenException('You can only approve or reject leaves for your employees');
      }
    }

    // Cannot update status if leave is already approved or rejected
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot update status of a leave that is already approved or rejected');
    }

    return this.prisma.leave.update({
      where: { id },
      data: {
        status: updateLeaveStatusDto.status,
        comment: updateLeaveStatusDto.comment,
        reviewedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    // Only the leave owner can delete it
    if (leave.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this leave');
    }

    // Cannot delete if leave is already approved or rejected
    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Cannot delete leave that is already approved or rejected');
    }

    return this.prisma.leave.delete({
      where: { id },
    });
  }
}
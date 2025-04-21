import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, AssignManagerDto, AssignTeamDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if the current user is updating their own profile or is an admin
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (id !== currentUserId && currentUser?.role !== Role.ADMIN) {
      throw new BadRequestException('You do not have permission to update this user');
    }

    // If changing role to MANAGER, ensure the user is not already a manager
    if (updateUserDto.role === Role.MANAGER && user.role !== Role.MANAGER) {
      // Check if the user already has a manager
      const hasManager = await this.prisma.user.findFirst({
        where: {
          managerId: id,
        },
      });

      if (hasManager) {
        throw new BadRequestException('This user is already a manager for other employees');
      }
    }

    // If changing managerId, ensure the manager exists and is a MANAGER or ADMIN
    if (updateUserDto.managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: updateUserDto.managerId },
      });

      if (!manager) {
        throw new NotFoundException(`Manager with ID ${updateUserDto.managerId} not found`);
      }

      if (manager.role !== Role.MANAGER && manager.role !== Role.ADMIN) {
        throw new BadRequestException('The assigned manager must have a MANAGER or ADMIN role');
      }
    }

    // If changing teamId, ensure the team exists and belongs to the same organization
    if (updateUserDto.teamId) {
      const team = await this.prisma.team.findUnique({
        where: { id: updateUserDto.teamId },
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${updateUserDto.teamId} not found`);
      }

      if (team.organizationId !== user.organizationId) {
        throw new BadRequestException('The team must belong to the same organization as the user');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async assignManager(id: string, assignManagerDto: AssignManagerDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const manager = await this.prisma.user.findUnique({
      where: { id: assignManagerDto.managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${assignManagerDto.managerId} not found`);
    }

    if (manager.role !== Role.MANAGER && manager.role !== Role.ADMIN) {
      throw new BadRequestException('The assigned manager must have a MANAGER or ADMIN role');
    }

    if (manager.organizationId !== user.organizationId) {
      throw new BadRequestException('The manager must belong to the same organization as the user');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        managerId: assignManagerDto.managerId,
      },
      include: {
        manager: {
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

  async assignTeam(id: string, assignTeamDto: AssignTeamDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const team = await this.prisma.team.findUnique({
      where: { id: assignTeamDto.teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${assignTeamDto.teamId} not found`);
    }

    if (team.organizationId !== user.organizationId) {
      throw new BadRequestException('The team must belong to the same organization as the user');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        teamId: assignTeamDto.teamId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getTeamMembers(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return team.members;
  }

  async getEmployees(managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: {
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    return manager.employees;
  }
}
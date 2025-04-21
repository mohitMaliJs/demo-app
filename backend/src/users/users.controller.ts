import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateUserDto, AssignManagerDto, AssignTeamDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Patch(':id/assign-manager')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  assignManager(
    @Param('id') id: string,
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    return this.usersService.assignManager(id, assignManagerDto);
  }

  @Patch(':id/assign-team')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  assignTeam(
    @Param('id') id: string,
    @Body() assignTeamDto: AssignTeamDto,
  ) {
    return this.usersService.assignTeam(id, assignTeamDto);
  }

  @Get('team/:teamId/members')
  getTeamMembers(@Param('teamId') teamId: string) {
    return this.usersService.getTeamMembers(teamId);
  }

  @Get('manager/:managerId/employees')
  getEmployees(@Param('managerId') managerId: string) {
    return this.usersService.getEmployees(managerId);
  }
}
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto, UpdateLeaveDto, UpdateLeaveStatusDto } from './dto/leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto, @Request() req) {
    return this.leavesService.create(createLeaveDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.leavesService.findAll(
      req.user.id,
      req.user.role,
      req.user.organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.leavesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeaveDto: UpdateLeaveDto,
    @Request() req,
  ) {
    return this.leavesService.update(id, updateLeaveDto, req.user.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateLeaveStatusDto: UpdateLeaveStatusDto,
    @Request() req,
  ) {
    return this.leavesService.updateStatus(
      id,
      updateLeaveStatusDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.leavesService.remove(id, req.user.id);
  }
}
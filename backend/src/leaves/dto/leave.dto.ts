import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeaveStatus, LeaveType } from '@prisma/client';

export class CreateLeaveDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  type: LeaveType;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(LeaveType)
  @IsOptional()
  type?: LeaveType;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @IsString()
  @IsOptional()
  comment?: string;
}
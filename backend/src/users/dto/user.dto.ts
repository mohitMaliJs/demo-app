import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;
}

export class AssignManagerDto {
  @IsString()
  @IsNotEmpty()
  managerId: string;
}

export class AssignTeamDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;
}
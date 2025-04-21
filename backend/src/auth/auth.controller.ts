import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterOrgDto, RegisterEmployeeDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-org')
  registerOrg(@Body() registerOrgDto: RegisterOrgDto) {
    return this.authService.registerOrg(registerOrgDto);
  }

  @Post('register-employee')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  registerEmployee(@Body() registerEmployeeDto: RegisterEmployeeDto) {
    return this.authService.registerEmployee(registerEmployeeDto);
  }
}
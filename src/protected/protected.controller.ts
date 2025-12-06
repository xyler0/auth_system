import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('protected')
export class ProtectedController {
    
  @Get('user-only')
  @UseGuards(JwtAuthGuard)
  getUserOnlyData(@CurrentUser() user: any) {
    return {
      message: 'This endpoint requires JWT authentication (user login)',
      authType: user.authType,
      user: {
        userId: user.userId,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('service-only')
  @UseGuards(ApiKeyAuthGuard)
  getServiceOnlyData(@CurrentUser() user: any) {
    return {
      message: 'This endpoint requires API key authentication (service-to-service)',
      authType: user.authType,
      service: {
        userId: user.userId,
        keyId: user.keyId,
        keyName: user.keyName,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('flexible')
  @UseGuards(CombinedAuthGuard)
  getFlexibleData(@CurrentUser() user: any) {
    return {
      message: 'This endpoint accepts both JWT and API key authentication',
      authType: user.authType,
      authenticatedAs: user.authType === 'jwt' ? 'User' : 'Service',
      details: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('profile')
  @UseGuards(CombinedAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Your authentication profile',
      profile: user,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  getAdminData(@CurrentUser() user: any) {
    return {
      message: 'Admin endpoint - typically would check user roles',
      user,
      note: 'Add role-based authorization for production use',
    };
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Protected')
@Controller('protected')
export class ProtectedController {
  @Get('user-only')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'JWT authentication only',
    description: 'This endpoint requires JWT Bearer token authentication (user login)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully accessed with JWT',
    schema: {
      example: {
        message: 'This endpoint requires JWT authentication (user login)',
        authType: 'jwt',
        user: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
        },
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
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
  @ApiSecurity('Api-Key')
  @ApiOperation({
    summary: 'API key authentication only',
    description: 'This endpoint requires X-API-Key header authentication (service-to-service)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully accessed with API key',
    schema: {
      example: {
        message: 'This endpoint requires API key authentication (service-to-service)',
        authType: 'api-key',
        service: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          keyId: 'key-uuid-here',
          keyName: 'Production Service',
        },
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid API key required in X-API-Key header',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('Api-Key')
  @ApiOperation({
    summary: 'Flexible authentication (JWT or API key)',
    description: 'This endpoint accepts either JWT Bearer token OR X-API-Key header authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully accessed with either auth method',
    schema: {
      example: {
        message: 'This endpoint accepts both JWT and API key authentication',
        authType: 'jwt',
        authenticatedAs: 'User',
        details: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
        },
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - either JWT token or API key required',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('Api-Key')
  @ApiOperation({
    summary: 'Get authentication profile',
    description: 'Returns information about the current authentication method and user/service details',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication profile retrieved',
  })
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Your authentication profile',
      profile: user,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin endpoint example',
    description: 'Example of an admin endpoint. In production, add role-based authorization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin data accessed',
  })
  getAdminData(@CurrentUser() user: any) {
    return {
      message: 'Admin endpoint - typically would check user roles any atm',
      user,
      note: 'role-based authorization for production use lol',
    };
  }
}

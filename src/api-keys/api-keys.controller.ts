import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('API Keys')
@Controller('keys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create a new API key',
    description: `Generate a new API key for service-to-service authentication. 
    Requires JWT authentication. The key value is only returned once - store it securely!`,
  })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        key: 'ak_1234567890abcdef1234567890abcdef',
        name: 'Production Service',
        description: 'API key for production microservice',
        expiresAt: '2025-12-31T23:59:59.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async create(@Request() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, createApiKeyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all your API keys',
    description: 'Get all API keys belonging to the authenticated user. Does not return actual key values.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of API keys',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Production Service',
          description: 'API key for production microservice',
          expiresAt: '2025-12-31T23:59:59.000Z',
          lastUsedAt: '2024-01-15T14:20:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async findAll(@Request() req) {
    return this.apiKeysService.findAllByUser(req.user.userId);
  }

  @Post(':keyId/revoke')
  @ApiOperation({
    summary: 'Revoke an API key',
    description: 'Mark an API key as revoked. The key will no longer work for authentication.',
  })
  @ApiParam({
    name: 'keyId',
    description: 'UUID of the API key to revoke',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
    schema: {
      example: {
        message: 'API key revoked successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
  })
  async revoke(@Request() req, @Param('keyId') keyId: string) {
    await this.apiKeysService.revoke(req.user.userId, keyId);
    return { message: 'API key revoked successfully' };
  }

  @Delete(':keyId')
  @ApiOperation({
    summary: 'Delete an API key',
    description: 'Permanently delete an API key. This action cannot be undone.',
  })
  @ApiParam({
    name: 'keyId',
    description: 'UUID of the API key to delete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'API key deleted successfully',
    schema: {
      example: {
        message: 'API key deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'API key not found',
  })
  async delete(@Request() req, @Param('keyId') keyId: string) {
    await this.apiKeysService.delete(req.user.userId, keyId);
    return { message: 'API key deleted successfully' };
  }
}
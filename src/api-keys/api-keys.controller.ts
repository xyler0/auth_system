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
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('keys')
@UseGuards(JwtAuthGuard) 
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post('create')
  async create(@Request() req, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.userId, createApiKeyDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.apiKeysService.findAllByUser(req.user.userId);
  }

  @Post(':keyId/revoke')
  async revoke(@Request() req, @Param('keyId') keyId: string) {
    await this.apiKeysService.revoke(req.user.userId, keyId);
    return { message: 'API key revoked successfully' };
  }

  @Delete(':keyId')
  async delete(@Request() req, @Param('keyId') keyId: string) {
    await this.apiKeysService.delete(req.user.userId, keyId);
    return { message: 'API key deleted successfully' };
  }
}

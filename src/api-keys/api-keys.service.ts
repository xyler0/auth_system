import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  private generateApiKey(): string {
    // Generate a secure API key with prefix
    const prefix = 'ak'; // api key prefix
    const uniqueId = uuidv4().replace(/-/g, '');
    return `${prefix}_${uniqueId}`;
  }

  async create(userId: string, createApiKeyDto: CreateApiKeyDto) {
    const key = this.generateApiKey();

    const apiKey = this.apiKeysRepository.create({
      key,
      name: createApiKeyDto.name,
      description: createApiKeyDto.description,
      userId,
      expiresAt: createApiKeyDto.expiresAt
        ? new Date(createApiKeyDto.expiresAt)
        : null,
    });

    const savedKey = await this.apiKeysRepository.save(apiKey);

    return {
      id: savedKey.id,
      key: savedKey.key, 
      name: savedKey.name,
      description: savedKey.description,
      expiresAt: savedKey.expiresAt,
      createdAt: savedKey.createdAt,
    };
  }

  async findAllByUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeysRepository.find({
      where: { userId, isRevoked: false },
      select: ['id', 'name', 'description', 'expiresAt', 'lastUsedAt', 'createdAt'],
    });
  }

  async validateApiKey(key: string): Promise<any> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { key },
      relations: ['user'],
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKey.isRevoked) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new UnauthorizedException('API key has expired');
    }

    if (!apiKey.user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last used timestamp
    await this.apiKeysRepository.update(apiKey.id, {
      lastUsedAt: new Date(),
    });

    return {
      userId: apiKey.userId,
      keyId: apiKey.id,
      keyName: apiKey.name,
      authType: 'api-key',
    };
  }

  async revoke(userId: string, keyId: string): Promise<void> {
    const apiKey = await this.apiKeysRepository.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.isRevoked = true;
    await this.apiKeysRepository.save(apiKey);
  }

  async delete(userId: string, keyId: string): Promise<void> {
    const result = await this.apiKeysRepository.delete({
      id: keyId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('API key not found');
    }
  }
}

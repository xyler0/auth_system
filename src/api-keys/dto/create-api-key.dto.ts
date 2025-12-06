import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
  @ApiProperty({
    example: 'Production Service',
    description: 'A descriptive name for the API key',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'API key for production microservice',
    description: 'Additional description about the key usage',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Optional expiration date for the API key (ISO 8601 format)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
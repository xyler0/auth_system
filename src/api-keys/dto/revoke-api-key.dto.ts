import { IsUUID } from 'class-validator';

export class RevokeApiKeyDto {
  @IsUUID()
  keyId: string;
}

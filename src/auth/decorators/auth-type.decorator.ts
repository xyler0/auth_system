import { SetMetadata } from '@nestjs/common';

export type AuthType = 'jwt' | 'api-key' | 'both';

export const AUTH_TYPE_KEY = 'authType';
export const AuthType = (type: AuthType) => SetMetadata(AUTH_TYPE_KEY, type);

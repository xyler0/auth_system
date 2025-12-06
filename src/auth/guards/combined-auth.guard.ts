import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CombinedAuthGuard extends AuthGuard(['jwt', 'api-key']) {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for Bearer token
    const authHeader = request.headers.authorization;
    const hasJwt = authHeader && authHeader.startsWith('Bearer ');
    
    // Check for API key
    const hasApiKey = !!request.headers['x-api-key'];

    if (!hasJwt && !hasApiKey) {
      throw new UnauthorizedException('No authentication credentials provided');
    }

    // Try JWT first, then API key
    try {
      if (hasJwt) {
        return (await super.canActivate(context)) as boolean;
      }
      if (hasApiKey) {
        return (await super.canActivate(context)) as boolean;
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication credentials');
    }

    return false;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}

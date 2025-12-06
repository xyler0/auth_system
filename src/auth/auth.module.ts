import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ApiKeyStrategy } from './strategies/api-key.strategy';

@Module({
  imports: [
    UsersModule,
     ApiKeysModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { 
    expiresIn: process.env.JWT_EXPIRATION ? Number(process.env.JWT_EXPIRATION) : 3600,
  },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}

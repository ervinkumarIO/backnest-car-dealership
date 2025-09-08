import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin, Staff } from '../entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'fallback-secret'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Admin, Staff]),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, SessionSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

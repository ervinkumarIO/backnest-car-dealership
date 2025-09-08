import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'fallback-secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.findUserById(payload.sub, payload.type);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      userType: payload.type,
    };
  }
}

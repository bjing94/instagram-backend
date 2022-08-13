import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';

export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: 'abcd',
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let secretData = req?.cookies['auth-cookie'];
          console.log(secretData);
          return secretData;
        },
      ]),
    });
  }

  private static extractJWT(req: Request): string | null {
    let secretData = req?.cookies['auth-cookie'];
    return secretData?.token;
  }
  //   Validation started in constructor not here.
  async validate(payload: { sub: string }) {
    console.log('my payload: ', payload);
    if (!payload) throw new UnauthorizedException();
    return {
      id: payload.sub,
    };
  }
}

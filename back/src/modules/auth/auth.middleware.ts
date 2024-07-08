import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('No token found in cookies');
    }

    try {
      const payload = this.jwtService.verify(token);
      req['user'] = payload;
      next();
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

import * as jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  exp?: number;
}

export class JwtTokenService {
  constructor(
    private secretAccess: string = process.env.JWT_SECRET_ACCESS,
    private accessExpire: string = "2h"
  ) {}

  createAccessToken(userId: string): string {
    if (!this.secretAccess) {
      throw new Error("JWT_SECRET_ACCESS is not defined");
    }
    return jwt.sign({ id: userId }, this.secretAccess, {
      expiresIn: this.accessExpire,
    });
  }

  verifyAccessToken(token: string): JwtPayload | null {
    if (!this.secretAccess) {
      throw new Error("JWT_SECRET_ACCESS is not defined");
    }
    try {
      const jwtToken = jwt.verify(token, this.secretAccess) as JwtPayload;

      if (this.validateTime(jwtToken) === false) {
        throw new Error("JWT_SECRET_ACCESS is not valid");
      }
      return jwtToken;
    } catch (error) {
      return null;
    }
  }

  validateTime(token: JwtPayload): boolean {
    if (!token || typeof token.exp !== "number") {
      return false;
    }
    const currentTime = Date.now() / 1000;
    return token.exp > currentTime;
  }
}

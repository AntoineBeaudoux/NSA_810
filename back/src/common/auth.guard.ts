import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtTokenService } from "./../modules/auth/jwtToken.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization }: any = request.headers;
      if (!authorization || authorization.trim() === "") {
        throw new UnauthorizedException("Please provide token");
      }
      const authToken = authorization.replace(/bearer/gim, "").trim();
      const resp = this.jwtTokenService.verifyAccessToken(authToken);
      request.decodedData = resp;
      return true;
    } catch (error) {
      console.log("auth error - ", error.message);
      throw new ForbiddenException(
        error.message || "Session expired! Please sign In"
      );
    }
  }
}

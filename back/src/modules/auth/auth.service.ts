import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from "express";
import * as bcrypt from "bcryptjs";

import { ErrorMessagesCustom } from "src/common/error-message";
import { Auth } from "./entities/auth.entity";
import { User } from "../users/entities/user.entity";
import { JwtTokenService } from "./jwtToken.service";

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private jwtTokenService: JwtTokenService
  ) {}

  extractTokenFromHeader(request: Request) {
    const headers = request.headers as { authorization?: string };

    if (!headers.authorization)
      throw new Error(ErrorMessagesCustom.HEADER_NOT_FOUND);

    const [type, token] = headers.authorization.split(" ");

    if (
      type?.localeCompare("Bearer") !== 0 ||
      token === undefined ||
      token?.length <= 10
    )
      throw new Error(ErrorMessagesCustom.TOKEN_NOT_FOUND);
    return token;
  }

  async login(userId: string, authId: string): Promise<Auth> {
    const authData: Partial<Auth> = {
      isLogged: true,
      jwtToken: this.jwtTokenService.createAccessToken(userId),
    };
    const user = await this.update(authId, authData);
    if (!user) this.logger.warn("User has not been updated");
    return this.findById(authId);
  }

  async logout(req: Request): Promise<Auth> {
    const token = this.extractTokenFromHeader(req);
    const auth = await this.findByToken(token);

    if (!auth) {
      throw new Error(ErrorMessagesCustom.USER_NOT_FOUND);
    }
    const authData: Partial<Auth> = {
      isLogged: false,
      jwtToken: "",
    };
    const user = await this.update(auth.id, authData);
    if (!user) this.logger.warn("User has not been updated");
    return this.findById(auth.id);
  }

  async create(user: User) {
    const authData: Partial<Auth> = {
      jwtToken: this.jwtTokenService.createAccessToken(user.id),
      isLogged: true,
    };

    const auth = this.authRepository.create(authData);
    await this.authRepository.save(auth);
    return auth;
  }

  async update(id: string, authData: any) {
    const { isLogged, jwtToken } = authData;
    return await this.authRepository.update(id, { isLogged, jwtToken });
  }

  async findByToken(token: string): Promise<Auth | null> {
    const jwtPayload = this.jwtTokenService.verifyAccessToken(token);

    if (!jwtPayload) {
      return null;
    }

    return new Promise((resolve) => {
      const auth = this.authRepository.findOne({
        where: {
          jwtToken: token,
        },
      });
      resolve(auth);
    });
  }

  async findById(id: string) {
    return await this.authRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  isLogged(auth: Auth) {
    if (auth.isLogged === true && auth.jwtToken !== null) {
      return true;
    } else return false;
  }

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Req,
  HttpStatus,
  HttpException,
  Logger,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";

import { LoginAuthDto } from "./dto/login-auth.dto";
import { RegisterAuthDto } from "./dto/register-auth.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "src/common/auth.guard";

import { User } from "../users/entities/user.entity";
import { ErrorMessagesCustom } from "src/common/error-message";
import { UserService } from "../users/users.service";
import { CreateUserDto } from "../users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("/login")
  async login(@Res() res: Response, @Body() loginAuthDto: LoginAuthDto) {
    try {
      const userExisting: User = await this.userService.findOne(
        loginAuthDto.username
      );

      if (!userExisting) {
        throw new Error(ErrorMessagesCustom.USER_NOT_FOUND);
      }

      if (this.authService.isLogged(userExisting.auth) === true) {
        return res.status(HttpStatus.OK).json({
          message: "The user is already logged",
        });
      }

      const isPasswordValid = await this.authService.comparePasswords(
        loginAuthDto.password,
        userExisting.password
      );
      if (!isPasswordValid) {
        throw new HttpException(
          "Invalid credentials.",
          HttpStatus.UNAUTHORIZED
        );
      }

      const auth = await this.authService.login(
        userExisting.id,
        userExisting.auth.id
      );
      userExisting.auth = auth;
      await this.userService.update(userExisting.id, { auth });
      return res.status(HttpStatus.OK).json({
        message: "The user has logged in successfully",
        token: userExisting.auth.jwtToken,
      });
    } catch (error) {
      throw new HttpException("Invalid credentials.", HttpStatus.NOT_FOUND);
    }
  }

  @Post("/register")
  async register(
    @Res() res: Response,
    @Body() registerAuthDto: RegisterAuthDto
  ) {
    let user = await this.userService.findOne(registerAuthDto.username);

    if (user === null) {
      user = await this.userService.create(registerAuthDto as CreateUserDto);
      const auth = await this.authService.create(user);
      user.auth = auth;

      await this.userService.update(user.id, { auth });

      return res.status(HttpStatus.OK).json({
        message: "The user has created and logged successfully",
        token: user.auth.jwtToken,
      });
    } else {
      this.logger.error("Username already exists");
      throw new HttpException("Username already exists", HttpStatus.CONFLICT);
    }
  }

  @UseGuards(AuthGuard)
  @Post("/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.logout(req);

      if (!user) this.logger.error("The user has been unable to logout");
      return res.status(HttpStatus.OK).json({
        message: "The user has successfully logged out",
      });
    } catch (error) {
      this.logger.error(error.message);
      switch (error.message) {
        case ErrorMessagesCustom.TOKEN_NOT_FOUND:
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Unvalid token",
          });

        default:
          return res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Invalid or expired token",
          });
      }
    }
  }
}

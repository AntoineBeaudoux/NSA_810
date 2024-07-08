import { Controller, Get, Post, Body, Param, Delete, Res, Req, HttpStatus, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';

import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthService } from './auth.service';

import { User } from '../users/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { UsersServices } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authServices: AuthService,
    private readonly usersServices: UsersServices
  ) {}

  @Post('/login')
  async login(@Res() res: Response, @Body() loginAuthDto: LoginAuthDto) {
    const userExisting: User = await this.usersServices.findOne(loginAuthDto.username);

    if (!userExisting) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    if (this.authServices.isLogged(userExisting.auth) === true) {
      return res.status(HttpStatus.OK).json({
        message: "The user is already logged"
      });
    }
    const auth = await this.authServices.login(userExisting.id, userExisting.auth.id);
    userExisting.auth = auth;
    await this.usersServices.update(userExisting.id, { auth });
    return res.status(HttpStatus.OK).json({
      message: "The user has logged in successfully",
      token: userExisting.auth.jwtToken
    });
  }

  @Post('/register')
  async register(@Res() res: Response, @Body() registerAuthDto: RegisterAuthDto) {
    let user = await this.usersServices.findOne(registerAuthDto.username);

    if (user === null) {
      user = await this.usersServices.create(registerAuthDto as CreateUserDto);
      const auth = await this.authServices.create(user);
      user.auth = auth;
      
      await this.usersServices.update(user.id, { auth });
      
      return res.status(HttpStatus.OK).json({
        message: "The user has created and logged successfully",
        token: user.auth.jwtToken
      });
    } else {
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }
  }

  @Post('/logout')
  async logout(@Req() req : Request, @Res() res: Response,) {
    const token = this.authServices.extractTokenFromHeader(req);
    const auth = await this.authServices.findByToken(token);
    
    if (auth) {
      const authData: Partial<Auth> = {
        isLogged: false,
        jwtToken: ""
      };
      this.authServices.update(auth.id, authData);
      return res.status(HttpStatus.OK).json({
        message: "The user has successfully logged out"
      })
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "Invalid or expired token"
      })
    }
  }

  @Get()
  findAll() {
    return this.authServices.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authServices.remove(+id);
  }
}

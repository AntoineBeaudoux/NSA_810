import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { Request } from 'express';

import { RegisterAuthDto } from './dto/register-auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto'
import { Auth } from './entities/auth.entity';
import { User } from '../users/entities/user.entity'
import { jwtTokenServices } from './jwtToken.services'
import { resolve } from 'path';
import { UsersServices } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private userServices: UsersServices,
    private jwtTokenServices: jwtTokenServices
  ) {}

  extractTokenFromHeader(request: Request) {
    const headers = request.headers as { authorization?: string };
    const [type, token] = headers.authorization?.split(' ') ?? [];
    
    if (type.localeCompare("Bearer") === 0)
      return token;
    else 
      return null;
  }

  async createIfNotExisting(createUserDto: RegisterAuthDto) {
    let user = await this.userServices.findOne(createUserDto.username);

    if (!user) {
      // Créer un nouvel utilisateur s'il n'existe pas
      user = await this.userServices.create(createUserDto as CreateUserDto);
    } else {
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }
  }

  async login(userId: string, authId: string) {
    const authData: Partial<Auth> = {
      isLogged: true,
      jwtToken: this.jwtTokenServices.createAccessToken(userId)
    }
    await this.update(authId, authData);
    return this.findById(authId);
  }

  async logout(user: User) {
    const authData: Partial<Auth> = {
      isLogged: false,
      jwtToken: null
    }
    return this.update(user.id, authData);
  }

  async create(user : User) {
    const authData : Partial<Auth> = {
      jwtToken: this.jwtTokenServices.createAccessToken(user.id),
      isLogged: true
    };

    const auth = this.authRepository.create(authData);
    await this.authRepository.save(auth);
    return auth;
  }

  async update(id: string, authData: any) {
    const { isLogged, jwtToken } = authData;
    return await this.authRepository.update(id, {isLogged, jwtToken})
  }

  async findByToken(token: string): Promise<Auth | null> {
    const jwtPayload = this.jwtTokenServices.verifyAccessToken(token);
    
    if (!jwtPayload) {
      return null;
    }

    return new Promise((resolve) => {
      const auth = this.authRepository.findOne({
        where: {
          jwtToken : token
        }
      });
      resolve(auth);
    }); 
  }

  async findById(id: string) {
    return await this.authRepository.findOne({
      where : {
        id: id
      }
    });
  }

  isLogged(auth : Auth) {
    if (auth.isLogged === true && auth.jwtToken !== null) {
      return true;
    } else 
      return false;
  }

  findAll() {
    return `This action returns all auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

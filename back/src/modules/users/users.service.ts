import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Auth } from '../auth/entities/auth.entity'; 

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const user = this.usersRepository.create(createUserDto);
      
      if (!user) {
        throw new Error("User wasn't created")
      }
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new HttpException('Could not create user.', HttpStatus.INTERNAL_SERVER_ERROR);
    }  
  }

  async createIfNotExisting(createUserDto: CreateUserDto): Promise<User> {
    let userExisting: User | null;
  
    try {
      userExisting = await this.findOne(createUserDto.username);
    } catch (error) {
      userExisting = null;
    }

    if (userExisting == null) {
      return this.create(createUserDto)
    } else {
      throw new HttpException('The username already exists.', HttpStatus.CONFLICT);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(param: string): Promise<User> {
    let user: User;
  
    if (param) {
      user = await this.usersRepository.findOne({ 
        where: [
          { username: param }
        ],
        relations: ['auth'] 
      });
    }
    return user || null;
  }

  async findAuthByUser(username: string): Promise<Auth | null> {
    const user = await this.usersRepository.findOne({ where: { username }, relations: ['auth'] });
    if (user && user.auth) {
      return user.auth;
    }
    return null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

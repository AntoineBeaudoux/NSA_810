import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { UsersModule } from '../users/users.module';
import { jwtTokenServices } from './jwtToken.services';

@Module({
  imports: [TypeOrmModule.forFeature([Auth]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, jwtTokenServices],
})
export class AuthModule {}
DefaultDeserializer;
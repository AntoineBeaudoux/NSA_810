import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthGuard } from '../../common/auth.guard';
import { JwtTokenService } from '../auth/jwtToken.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, AuthGuard, JwtTokenService],
  exports: [UserService]
})
export class UsersModule {}

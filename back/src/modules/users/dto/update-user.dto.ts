import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Auth } from 'src/modules/auth/entities/auth.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  auth: Auth
}

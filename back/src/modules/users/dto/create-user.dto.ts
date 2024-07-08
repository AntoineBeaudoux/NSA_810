import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;
  
  @IsNotEmpty()
  @IsString()
  password: string;
}

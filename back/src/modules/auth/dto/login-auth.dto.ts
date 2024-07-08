import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;
  
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
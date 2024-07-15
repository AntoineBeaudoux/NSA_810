import { Controller, Get, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';

import { LoggingInterceptor } from '../../logging.interceptor'
import { UsersServices } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UsersServices) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

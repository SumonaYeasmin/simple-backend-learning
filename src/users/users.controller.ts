
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    createUser(@Body() data: CreateUserDto) {
        return this.usersService.createUser(data);
    }

    @Patch(':id')
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateUserDto,
    ) {
        return this.usersService.updateUser(Number(id), data);
    }
    @Delete(':id') deleteUser(@Param('id') id: string) { return this.usersService.deleteUser(Number(id)); }

  @Get()
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // string কে number এ রূপান্তর করে পাঠানো হচ্ছে
    return this.usersService.getUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }
}
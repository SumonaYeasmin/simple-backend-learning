
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    createUser(@Body() data: { name: string; email: string }) {
        return this.usersService.createUser(data);
    }

    @Get() getUsers() { return this.usersService.getUsers(); }

    @Patch(':id')
    updateUser(
        @Param('id') id: string,
        @Body() data: { name: string; email: string },
    ) {
        return this.usersService.updateUser(Number(id), data);
    }
    @Delete(':id') deleteUser(@Param('id') id: string) { return this.usersService.deleteUser(Number(id)); }


}
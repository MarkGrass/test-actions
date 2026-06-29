import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { USER_ROLE } from '@shared/types';

import { Role } from '@decorators';

import { User } from '@entities';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('User Module')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @ApiOperation({ summary: 'Create new user' })
    @UseInterceptors(ClassSerializerInterceptor)
    @Role(USER_ROLE.ADMIN)
    @Post()
    createUsers(@Body() user: CreateUserDto) {
        return this.userService.create(user);
    }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [User] })
    @UseInterceptors(ClassSerializerInterceptor)
    @Role(USER_ROLE.ADMIN)
    @Get()
    getUsers(@Query() filters: GetUsersDto) {
        return this.userService.getUsers(filters);
    }

    @ApiOperation({ summary: 'Get user by id' })
    @ApiResponse({ status: 200, type: User })
    @UseInterceptors(ClassSerializerInterceptor)
    @Role(USER_ROLE.ADMIN)
    @Get('/:id')
    getUser(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @ApiOperation({ summary: 'Update user by id' })
    @ApiResponse({ status: 200, type: User })
    @UseInterceptors(ClassSerializerInterceptor)
    @Role(USER_ROLE.ADMIN)
    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.userService.updateUser(id, data);
    }

    @ApiOperation({ summary: 'Delete user by id' })
    @ApiResponse({ status: 200 })
    @Role(USER_ROLE.ADMIN)
    @Delete('/:id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }
}

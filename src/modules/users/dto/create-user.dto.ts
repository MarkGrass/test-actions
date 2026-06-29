import { ApiProperty } from '@nestjs/swagger';

import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

import { USER_ROLE, USER_STATUS } from '@shared/types';

export class CreateUserDto {
    @ApiProperty({
        example: 'example@mail.com',
        description: 'User email address',
    })
    @IsString()
    @IsEmail()
    @Length(6, 255)
    email: string;

    @ApiProperty({
        example: 'ia!Sbc971n#63ra+9G',
        description: 'User password',
    })
    @IsString()
    @Length(8, 255)
    password: string;

    @ApiProperty({
        example: 'GUEST',
        description: 'Create user with specific role',
    })
    @IsOptional()
    @IsEnum(USER_ROLE)
    role?: USER_ROLE;

    @ApiProperty({
        example: 'FROZEN',
        description: 'Create user with specific status',
    })
    @IsOptional()
    @IsEnum(USER_STATUS)
    status?: USER_STATUS;

    @ApiProperty({
        example: 'ia!Sbc971n#63ra+9G',
        description: 'User password',
    })
    @IsString()
    @IsOptional()
    @Length(3, 255)
    name?: string;

    @ApiProperty({
        example: 'The best user ever',
        description: 'Note about the user',
    })
    @IsString()
    @IsOptional()
    @Length(3, 2000)
    note?: string;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'Subscription expiration time',
    })
    @IsString()
    @IsDateString()
    @IsOptional()
    subscriptionExpired?: string;

    @ApiProperty({
        example: 'false',
        description: 'Is verified user email',
    })
    @IsBoolean()
    @IsOptional()
    isVerifiedEmail?: boolean;
}

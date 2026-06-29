import { ApiProperty } from '@nestjs/swagger';

import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

import { USER_ROLE, USER_STATUS } from '@shared/types';

export class UpdateUserDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Add a user name',
    })
    @IsOptional()
    @IsString()
    @Length(3, 255)
    name?: string;

    @ApiProperty({
        example: 'The worst user',
        description: 'Add a new note about a user',
    })
    @IsOptional()
    @IsString()
    @Length(3, 2000)
    note?: string;

    @ApiProperty({
        example: 'USER',
        description: 'Change user role',
    })
    @IsOptional()
    @IsEnum(USER_ROLE)
    role?: USER_ROLE;

    @ApiProperty({
        example: 'GUEST',
        description: 'Change user status',
    })
    @IsOptional()
    @IsEnum(USER_STATUS)
    status?: USER_STATUS;

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

    @IsOptional()
    @IsString()
    emailVerificationCode?: string | null;

    @IsOptional()
    @IsString()
    emailVerificationExpires?: Date | null;

    @IsOptional()
    @IsNumber()
    emailVerificationAttempts?: number;
}

import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
    IsAlphanumeric,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

import { USER_ROLE, USER_STATUS } from '@shared/types';

import { PaginationDto } from './pagination.dto';

export class GetUsersDto extends PaginationDto {
    @ApiProperty({
        example: 'John',
        description: 'Search by user name or email',
    })
    @IsOptional()
    @IsString()
    @IsAlphanumeric()
    @Length(3, 60)
    search?: string;

    @ApiProperty({
        description: 'Check if the user has a note',
    })
    @IsOptional()
    @Transform(({ value }: { value: string | boolean }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;

        return value;
    })
    @IsBoolean()
    hasNote?: boolean;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'All users created after date',
    })
    @IsOptional()
    @IsDateString()
    createdFrom?: string;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'All users created before date',
    })
    @IsOptional()
    @IsDateString()
    createdTo?: string;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'All users have logged in since after date',
    })
    @IsOptional()
    @IsDateString()
    lastLoginFrom?: string;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'All users have logged in before date',
    })
    @IsOptional()
    @IsDateString()
    lastLoginTo?: string;

    @ApiProperty({
        example: 'GUEST',
        description: 'All users with role',
    })
    @IsOptional()
    @IsEnum(USER_ROLE)
    role?: USER_ROLE;

    @ApiProperty({
        example: 'GUEST',
        description: 'All users with status',
    })
    @IsOptional()
    @IsEnum(USER_STATUS)
    status?: USER_STATUS;
}

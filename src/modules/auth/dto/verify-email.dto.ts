import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({
        example: 'example@mail.com',
        description: 'User email address',
    })
    @IsString()
    @IsEmail()
    @Length(6, 255)
    email: string;

    @ApiProperty({
        example: '643976',
        description: 'Email verification code',
    })
    @IsString()
    @Length(6, 6)
    code: string;
}

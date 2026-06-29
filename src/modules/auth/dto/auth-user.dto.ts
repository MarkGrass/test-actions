import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString, Length } from 'class-validator';

export class AuthUserDto {
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
}

import { ApiProperty } from '@nestjs/swagger';

import {
    IsEmail,
    IsObject,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

export class SendEmailDto {
    @ApiProperty({
        example: 'example@mail.com',
        description: 'User email address',
    })
    @IsString()
    @IsEmail()
    @Length(6, 255)
    to: string;

    @ApiProperty({
        example: 'Verification email',
        description: 'Email subject',
    })
    @IsString()
    @Length(1, 255)
    subject: string;

    @ApiProperty({
        example: 'verification',
        description: 'Email template name',
    })
    @IsString()
    template: string;

    @ApiProperty({
        example: '{ name: "John Doe" }',
        description: 'Email variables context',
    })
    @IsOptional()
    @IsObject()
    context?: Record<string, unknown>;
}

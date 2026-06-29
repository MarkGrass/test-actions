import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Entity, Column } from 'typeorm';

import { Exclude } from 'class-transformer';

import { USER_ROLE, USER_STATUS } from '../types';

import { BaseEntity } from './base.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @ApiProperty({
        example: 'example@mail.com',
        description: 'User email address',
    })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User name',
    })
    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string | null;

    @ApiProperty({
        example: '$2b$10$AQiIpGH/jXrVtfm0EIWwG.D1O1gzM7z32/8Gsb/Gbx30486wQtiEa',
        description:
            'User password as hash, protected field only for backend, not showing on front',
    })
    @Exclude()
    @Column({ type: 'varchar', length: 255 })
    password: string;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'Last login date',
    })
    @Column({
        type: 'timestamptz',
        nullable: true,
    })
    lastLogin: string | null;

    @ApiProperty({
        example: 'The best user ever',
        description: 'Note about the user',
    })
    @Column({ type: 'varchar', length: 2000, nullable: true })
    note: string | null;

    @ApiProperty({
        example: 'ACTIVE',
        description:
            'User status,' +
            'ACTIVE - active user with a paid subscription,' +
            'INACTIVE - a user whose last login was more then 1 month ago,' +
            'FROZEN - user without a paid subscription,' +
            'BLOCKED - user blocked by administrator',
    })
    @Column({ type: 'enum', enum: USER_STATUS, default: USER_STATUS.ACTIVE })
    status: USER_STATUS;

    @ApiProperty({
        example: '2026-01-25T00:00:00.000Z',
        description: 'Subscription expiration time',
    })
    @Column({
        type: 'timestamptz',
        nullable: true,
    })
    subscriptionExpired: string | null;

    @ApiProperty({
        example: 'GUEST',
        description: 'User role',
    })
    @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.GUEST })
    role: USER_ROLE;

    @ApiProperty({
        example: 'false',
        description: 'Is verified user email',
    })
    @Column({ type: 'boolean', default: false })
    isVerifiedEmail: boolean;

    @Column({ type: 'varchar', nullable: true })
    emailVerificationCode: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    emailVerificationExpires: Date | null;

    @Column({ type: 'int', default: 0 })
    emailVerificationAttempts: number;

    @ApiHideProperty()
    @Column({ type: 'varchar', nullable: true })
    hashedRefreshToken: string | null;
}

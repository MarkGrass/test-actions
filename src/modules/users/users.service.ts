import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, Repository } from 'typeorm';

import { hash } from 'argon2';

import { User } from '@entities';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async updateHashedRefreshToken(id: string, token: string | null) {
        return this.userRepository.update(id, { hashedRefreshToken: token });
    }

    async create(data: CreateUserDto): Promise<User> {
        const user = this.userRepository.create({
            ...data,
            password: await hash(data.password),
        });

        return await this.userRepository.save(user);
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        const { affected } = await this.userRepository.update(id, data);
        if (!affected) {
            throw new NotFoundException(`Пользователь с id ${id} не найден`);
        }

        return await this.userRepository.findOneByOrFail({ id });
    }

    async getUsers(query: GetUsersDto): Promise<User[]> {
        const {
            cursor,
            limit = 10,
            search,
            hasNote,
            createdFrom,
            createdTo,
            lastLoginFrom,
            lastLoginTo,
            role,
            status,
        } = query;
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .orderBy('user.created', 'DESC')
            .addOrderBy('user.id', 'DESC')
            .limit(limit);

        if (search) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('user.name ILIKE :search', {
                        search: `%${search}%`,
                    }).orWhere('user.email ILIKE :search', {
                        search: `%${search}%`,
                    });
                }),
            );
        }

        if (typeof hasNote === 'boolean') {
            queryBuilder.andWhere(
                hasNote
                    ? "user.note IS NOT NULL AND user.note != ''"
                    : "(user.note IS NULL OR user.note = '')",
            );
        }

        if (createdFrom) {
            queryBuilder.andWhere('user.created >= :createdFrom', {
                createdFrom,
            });
        }

        if (createdTo) {
            queryBuilder.andWhere('user.created <= :createdTo', {
                createdTo,
            });
        }

        if (lastLoginFrom) {
            queryBuilder.andWhere('user.lastLogin >= :lastLoginFrom', {
                lastLoginFrom,
            });
        }

        if (lastLoginTo) {
            queryBuilder.andWhere('user.lastLogin <= :lastLoginTo', {
                lastLoginTo,
            });
        }

        if (role) {
            queryBuilder.andWhere('user.role = :role', { role });
        }

        if (status) {
            queryBuilder.andWhere('user.status = :status', { status });
        }

        if (cursor) {
            const cursorUser = await this.userRepository.findOneByOrFail({
                id: cursor,
            });

            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('user.created < :cursorCreated', {
                        cursorCreated: cursorUser.created,
                    }).orWhere(
                        'user.created = :cursorCreated AND user.id < :cursorId',
                        {
                            cursorCreated: cursorUser.created,
                            cursorId: cursorUser.id,
                        },
                    );
                }),
            );
        }

        return await queryBuilder.getMany();
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ id });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOneBy({ email });
    }

    async deleteUser(id: string): Promise<void> {
        const { affected } = await this.userRepository.delete({ id });

        if (!affected) {
            throw new NotFoundException(`Пользователь с id ${id} не найден`);
        }
    }
}

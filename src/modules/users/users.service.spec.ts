import { NotFoundException } from '@nestjs/common';

import { hash } from 'argon2';

import { USER_ROLE, USER_STATUS } from '@shared/types';

import { UsersService } from './users.service';

jest.mock('argon2', () => ({
    hash: jest.fn(),
}));

const mockHash = jest.mocked(hash);

describe('UsersService', () => {
    const user = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        role: USER_ROLE.GUEST,
        status: USER_STATUS.ACTIVE,
        created: '2026-01-01T00:00:00.000Z',
        updated: '2026-01-01T00:00:00.000Z',
        name: null,
        note: null,
        lastLogin: null,
        subscriptionExpired: null,
        isVerifiedEmail: false,
        hashedRefreshToken: null,
    };

    const createRepository = () => ({
        create: jest.fn(),
        createQueryBuilder: jest.fn(),
        delete: jest.fn(),
        findOneBy: jest.fn(),
        findOneByOrFail: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    });

    const createQueryBuilder = () => ({
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([user]),
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockHash.mockResolvedValue('hashed-password');
    });

    it('hashes a password before creating a user', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.create.mockReturnValue(user);
        repository.save.mockResolvedValue(user);

        const result = await service.create({
            email: user.email,
            password: 'password123',
            role: USER_ROLE.USER,
        });

        expect(mockHash).toHaveBeenCalledWith('password123');
        expect(repository.create).toHaveBeenCalledWith({
            email: user.email,
            password: 'hashed-password',
            role: USER_ROLE.USER,
        });
        expect(repository.save).toHaveBeenCalledWith(user);
        expect(result).toBe(user);
    });

    it('updates a user and returns the saved entity', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.update.mockResolvedValue({ affected: 1 });
        repository.findOneByOrFail.mockResolvedValue(user);

        await expect(
            service.updateUser(user.id, { name: 'John Doe' }),
        ).resolves.toBe(user);
        expect(repository.update).toHaveBeenCalledWith(user.id, {
            name: 'John Doe',
        });
        expect(repository.findOneByOrFail).toHaveBeenCalledWith({
            id: user.id,
        });
    });

    it('throws when updating a missing user', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.update.mockResolvedValue({ affected: 0 });

        await expect(
            service.updateUser(user.id, { name: 'John Doe' }),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates the stored refresh token hash', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);

        await service.updateHashedRefreshToken(user.id, 'refresh-hash');

        expect(repository.update).toHaveBeenCalledWith(user.id, {
            hashedRefreshToken: 'refresh-hash',
        });
    });

    it('builds a filtered users query', async () => {
        const repository = createRepository();
        const queryBuilder = createQueryBuilder();
        const service = new UsersService(repository as never);
        repository.createQueryBuilder.mockReturnValue(queryBuilder);

        const result = await service.getUsers({
            hasNote: true,
            limit: 20,
            role: USER_ROLE.ADMIN,
            search: 'John',
            status: USER_STATUS.ACTIVE,
        });

        expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
        expect(queryBuilder.limit).toHaveBeenCalledWith(20);
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(Object));
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            "user.note IS NOT NULL AND user.note != ''",
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'user.role = :role',
            {
                role: USER_ROLE.ADMIN,
            },
        );
        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            'user.status = :status',
            { status: USER_STATUS.ACTIVE },
        );
        expect(result).toEqual([user]);
    });

    it('returns users by id and email', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.findOneBy.mockResolvedValue(user);

        await expect(service.getUserById(user.id)).resolves.toBe(user);
        expect(repository.findOneBy).toHaveBeenCalledWith({ id: user.id });

        await expect(service.getUserByEmail(user.email)).resolves.toBe(user);
        expect(repository.findOneBy).toHaveBeenCalledWith({
            email: user.email,
        });
    });

    it('deletes an existing user', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.delete.mockResolvedValue({ affected: 1 });

        await expect(service.deleteUser(user.id)).resolves.toBeUndefined();
        expect(repository.delete).toHaveBeenCalledWith({ id: user.id });
    });

    it('throws when deleting a missing user', async () => {
        const repository = createRepository();
        const service = new UsersService(repository as never);
        repository.delete.mockResolvedValue({ affected: 0 });

        await expect(service.deleteUser(user.id)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});

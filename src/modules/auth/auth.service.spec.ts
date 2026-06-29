import { HttpException, UnauthorizedException } from '@nestjs/common';

import { hash, verify } from 'argon2';

import { USER_ROLE, USER_STATUS } from '@shared/types';

import type { User } from '@entities';

import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
}));

const mockHash = jest.mocked(hash);
const mockVerify = jest.mocked(verify);

describe('AuthService', () => {
    const refreshConfig = {
        secret: 'refresh-secret',
        expiresIn: '7d',
    };

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
        emailVerificationCode: null,
        emailVerificationExpires: null,
        emailVerificationAttempts: 0,
        hashedRefreshToken: 'stored-refresh-hash',
    };

    const createMocks = () => {
        const userService = {
            create: jest.fn(),
            getUserByEmail: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
        };
        const jwtService = {
            signAsync: jest
                .fn()
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token'),
        };
        const emailService = {
            sendMail: jest.fn(),
        };
        const configService = {
            get: jest.fn().mockReturnValue(5),
            getOrThrow: jest.fn().mockReturnValue('30m'),
        };

        const service = new AuthService(
            userService as never,
            jwtService as never,
            emailService as never,
            configService as never,
            refreshConfig as never,
        );

        return {
            jwtService,
            service,
            userService,
            emailService,
            configService,
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHash.mockResolvedValue('hashed-refresh-token');
        mockVerify.mockResolvedValue(true);
    });

    it('registers a new user and sends a verification code', async () => {
        const { emailService, jwtService, service, userService } =
            createMocks();
        userService.getUserByEmail.mockResolvedValue(null);
        userService.create.mockResolvedValue(user);
        userService.updateUser.mockResolvedValue(user);

        const result = await service.registration({
            email: user.email,
            password: 'password123',
        });

        expect(userService.create).toHaveBeenCalledWith({
            email: user.email,
            password: 'password123',
        });
        expect(mockHash).toHaveBeenCalledWith(expect.stringMatching(/^\d{6}$/));
        expect(userService.updateUser).toHaveBeenCalledWith(
            user.id,
            expect.objectContaining({
                emailVerificationCode: 'hashed-refresh-token',
                emailVerificationExpires: expect.any(Date),
                emailVerificationAttempts: 0,
            }),
        );
        expect(emailService.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: user.email,
                subject: 'Код подтверждегния',
                template: 'verification',
                context: {
                    code: expect.stringMatching(/^\d{6}$/),
                },
            }),
        );
        expect(jwtService.signAsync).not.toHaveBeenCalled();
        expect(userService.updateHashedRefreshToken).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            message: 'Проверочный код отправлен на вашу почту.',
        });
    });

    it('does not pass extra registration fields to user creation', async () => {
        const { service, userService } = createMocks();
        userService.getUserByEmail.mockResolvedValue(null);
        userService.create.mockResolvedValue(user);
        userService.updateUser.mockResolvedValue(user);

        await service.registration({
            email: user.email,
            password: 'password123',
            role: USER_ROLE.ADMIN,
        } as never);

        expect(userService.create).toHaveBeenCalledWith({
            email: user.email,
            password: 'password123',
        });
    });

    it('rejects registration for an existing email', async () => {
        const { service, userService } = createMocks();
        userService.getUserByEmail.mockResolvedValue(user);

        await expect(
            service.registration({
                email: user.email,
                password: 'password123',
            }),
        ).rejects.toBeInstanceOf(HttpException);
        expect(userService.create).not.toHaveBeenCalled();
    });

    it('rotates tokens on login for a verified user', async () => {
        const { service, userService } = createMocks();
        const verifiedUser = {
            ...user,
            isVerifiedEmail: true,
        };

        await expect(
            service.login(verifiedUser as unknown as User),
        ).resolves.toEqual({
            id: user.id,
            access: 'access-token',
            refresh: 'refresh-token',
        });
        expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
            user.id,
            'hashed-refresh-token',
        );
    });

    it('rejects login for an unverified user', async () => {
        const { service, userService } = createMocks();

        await expect(
            service.login(user as unknown as User),
        ).rejects.toBeInstanceOf(UnauthorizedException);
        expect(userService.updateHashedRefreshToken).not.toHaveBeenCalled();
    });

    it('validates a refresh token against the stored hash', async () => {
        const { service, userService } = createMocks();
        userService.getUserById.mockResolvedValue(user);

        await expect(
            service.validateRefreshToken(user.id, 'refresh-token'),
        ).resolves.toEqual(user);
        expect(mockVerify).toHaveBeenCalledWith(
            user.hashedRefreshToken,
            'refresh-token',
        );
    });

    it('rejects invalid refresh tokens', async () => {
        const { service, userService } = createMocks();
        userService.getUserById.mockResolvedValue(user);
        mockVerify.mockResolvedValue(false);

        await expect(
            service.validateRefreshToken(user.id, 'refresh-token'),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('clears the stored refresh token on logout', async () => {
        const { service, userService } = createMocks();

        await expect(service.logout(user as unknown as User)).resolves.toEqual({
            success: true,
        });
        expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
            user.id,
            null,
        );
    });
});

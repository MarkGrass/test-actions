import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
    TypeOrmModuleOptions,
    TypeOrmOptionsFactory,
} from '@nestjs/typeorm';

import { User } from '@entities';

@Injectable()
export class TypeORMConfigFactory implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const isDev =
            this.configService.getOrThrow('NODE_ENV') === 'development';

        return {
            type: 'postgres',
            host: this.configService.getOrThrow('POSTGRES_HOST'),
            port: Number(this.configService.getOrThrow('POSTGRES_PORT')),
            username: this.configService.getOrThrow('POSTGRES_USER'),
            password: this.configService.getOrThrow('POSTGRES_PASSWORD'),
            database: this.configService.getOrThrow('POSTGRES_DB'),
            entities: [User],
            dropSchema: false,
            logging: false,
            synchronize: isDev,
            ssl: !isDev,
        };
    }
}

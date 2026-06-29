import { join } from 'path';

import { registerAs } from '@nestjs/config';

import type { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

export const mailerConfig = registerAs('email', (): MailerOptions => ({
    transport: {
        host: process.env.MAIL_TRANSPORT,
        port: 587,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    },
    defaults: {
        from: `Ignegina <${process.env.MAIL_ADDRESS}>`,
    },
    template: {
        dir: join(__dirname, '../email/templates'),
        adapter: new HandlebarsAdapter(),
    },
}));

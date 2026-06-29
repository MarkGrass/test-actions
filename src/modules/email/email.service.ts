import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { SendEmailDto } from '@modules/email/dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
    constructor(private mailerService: MailerService) {}

    async sendMail(data: SendEmailDto) {
        await this.mailerService.sendMail(data).catch((err) => {
            throw new HttpException(
                `Email service error: ${JSON.stringify(err)}`,
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        });
    }
}

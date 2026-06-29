import type { IncomingMessage, Server } from 'http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import type { SwaggerCustomOptions } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerInit = (
    app: NestExpressApplication<Server<typeof IncomingMessage>>,
) => {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Ignegina')
        .setDescription('REST API documentation')
        .setVersion('0.0.2')
        .build();
    const swaggerDoc = () => SwaggerModule.createDocument(app, swaggerConfig);
    const options: SwaggerCustomOptions = {
        explorer: true,
        swaggerOptions: {
            apisSorter: 'alpha',
            tagsSorter: 'alpha',
        },
    };

    SwaggerModule.setup('api/docs', app, swaggerDoc, options);
};

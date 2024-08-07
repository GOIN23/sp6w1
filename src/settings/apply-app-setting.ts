import { BadRequestException, INestApplication, ValidationPipe, } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/utilit/exception-filters/http-exception-filter';

// Префикс нашего приложения (http://site.com/api)
const APP_PREFIX = '/api';

// Используем данную функцию в main.ts и в e2e тестах
export const applyAppSettings = (app: INestApplication) => {
    // Применение глобальных Interceptors
    // app.useGlobalInterceptors()
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    // Применение глобальных Guards
    //  app.useGlobalGuards(new AuthGuard());

    // Применить middleware глобально

    // Установка префикса
    setAppPrefix(app);


    // Применение глобальных pipes
    setAppPipes(app);

    // Применение глобальных exceptions filters
    setAppExceptionsFilters(app);
};

const setAppPrefix = (app: INestApplication) => {
    // Устанавливается для разворачивания front-end и back-end на одном домене
    // https://site.com - front-end
    // https://site.com/api - backend-end
    app.setGlobalPrefix(APP_PREFIX);
};



const setAppPipes = (app: INestApplication) => {

    app.useGlobalPipes(
        new ValidationPipe({
            
            // Для работы трансформации входящих данных
            transform: true,
            // Выдавать первую ошибку для каждого поля
            stopAtFirstError: true,
            // Перехватываем ошибку, кастомизируем её и выкидываем 400 с собранными данными
            exceptionFactory: (errors) => {

                const customErrors = [];

                errors.forEach((e) => {
                    const constraintKeys = Object.keys(e.constraints);

                    constraintKeys.forEach((cKey) => {
                        const msg = e.constraints[cKey];

                        customErrors.push({ message: msg, field: e.property });
                    });
                });

                // Error 400
                throw new BadRequestException(customErrors);
            },
        }),
    );
};

const setAppExceptionsFilters = (app: INestApplication) => {
    app.useGlobalFilters(new HttpExceptionFilter());
};

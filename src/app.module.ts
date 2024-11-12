import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { ContentModule } from './features/content/content.moudle';
import { QuestionModule } from './features/quiz/quiz.module';
import { DeleteAllsController } from './features/testing-all-data/testing-all-data';
import { UserModule } from './features/user/user.module';
import configuration, { DbSettingsSettingsType, EnvironmentSettingsType, validate } from './settings/configuration';
import { CoreModule } from './utilit/core.modu';
import { LoggerMiddlewar2, LoggerMiddleware } from './utilit/middlewares/logger.middleware';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'typeORMtestNest',
      autoLoadEntities: true,
      synchronize: false,
      logging: true
    }),

    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const environmentSettings = configService.get<EnvironmentSettingsType>('environmentSettings', {
          infer: true,
        });

        const databaseSettings = configService.get<DbSettingsSettingsType>('dbSettings', {
          infer: true,
        });


        const uri = environmentSettings.isTesting
          ? databaseSettings.MONGO_CONNECTION_URI_TEST
          : databaseSettings.MONGO_CONNECTION_URI;


        return {
          uri: uri,
        };
      },
      inject: [ConfigService], // Инъекция ConfigService
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
    }),
    CoreModule,

    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5,
    }]),

    AuthModule,

    UserModule,

    ContentModule,
    QuestionModule,
  ],
  // providers: [{
  //   provide: APP_GUARD,
  //   useClass: ThrottlerGuard
  // }],
  controllers: [DeleteAllsController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware)
      .forRoutes("*") // То есть данный middleware будет применяться ко всем роутерам данного моделя.
      .apply(LoggerMiddlewar2)
      .forRoutes({ // Есть возможность прмиенить цепочку middleware. Также применить конкретный middleware к конкретнму элемнту эндпоинта и методу.
        path: "blogs",
        method: RequestMethod.GET
      })
  }

}



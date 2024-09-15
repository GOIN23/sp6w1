import { Global, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { User, UserSchema } from './features/user/domain/createdBy-user-Admin.entity';

import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';

import { RecoveryPassword, RecoveryPasswordSchema } from './features/auth/domain/recovery-password-code';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ApiSettingsType, DbSettingsSettingsType, EnvironmentSettingsType } from './settings/configuration';
import { CqrsModule } from '@nestjs/cqrs';

import { Comments, CommentSchema } from './features/content/comments/domain/comments.entity';
import { LoggerMiddlewar2, LoggerMiddleware } from './utilit/middlewares/logger.middleware';


import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './features/auth/auth.module';

import { UserModule } from './features/user/user.module';
import { ContentModule } from './features/content/content.moudle';
import { UtilitModule } from './utilit/utitli.module';
import { CoreModule } from './utilit/core.modu';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'northwind',
      autoLoadEntities: false,
      synchronize: false,
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
      load: [configuration]
    }),

    CoreModule,

    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5,
    }]),

    AuthModule,
    UserModule,
    ContentModule,
    UtilitModule
  ],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
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



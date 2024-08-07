import { Schema } from '@nestjs/mongoose';

import { Module, Provider } from '@nestjs/common';
import { LoginIsExistContsraint } from './features/user/validate/login-is-exist.decorator';
import { UsersRepository } from './features/user/infrastructure/users.repository';
import { UsersService } from './features/user/application/users.service';
import { UsersQueryRepository } from './features/user/infrastructure/users.query-repository';
import { BlogRepository } from './features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { PostsService } from './features/posts/application/posts.service';
import { BlogService } from './features/blogs/application/blog.service';
import { User, UserSchema } from './features/user/domain/createdBy-user-Admin.entity';
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity';
import { Posts, PostSchema } from './features/posts/domain/posts.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './features/user/user.controller';
import { BlogsController } from './features/blogs/blog.controller';
import { PostsController } from './features/posts/posts.controller';
import { DeleteAllsController } from './features/testing-all-data/testing-all-data';
import { PostRepository } from './features/posts/infrastructure/posts.repository';
import { EmailIsExistContsraint } from './features/user/validate/email-is-exist.decorator';
import { JwtModule } from '@nestjs/jwt';
import { UsersAuthService } from './features/auth/application/auth-service';
import { EmailAdapter } from './features/auth/application/emai-Adapter';
import { UsersCreatedRepository } from './features/auth/infrastructure/users.repository';
import { AuthController } from './features/auth/api/auth.controller';
import { RecoveryPassword, RecoveryPasswordSchema } from './features/auth/domain/recovery-password-code';
import { JwtAccessStrategy } from './utilit/strategies/jwt-auth-strategies';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType, validate } from './settings/configuration';
import { CqrsModule } from '@nestjs/cqrs';






const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository]
const blogsProvides: Provider[] = [BlogService, BlogRepository, BlogsQueryRepository]
const postsProvedis: Provider[] = [PostsService, PostsQueryRepository, PostRepository]
const authProviders: Provider[] = [UsersAuthService, EmailAdapter, UsersCreatedRepository]


@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<ConfigurationType>('dbSettings', { infer: true }).MONGO_CONNECTION_URI
      }),
      inject: [ConfigService], // Инъекция ConfigService
    }), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Blog.name, schema: BlogSchema }, { name: Posts.name, schema: PostSchema }, { name: RecoveryPassword.name, schema: RecoveryPasswordSchema },]),
    JwtModule.register({
      secret: 'your_secret_key', // Замените на ваш секретный ключ
      signOptions: { expiresIn: '5m' }, // Время жизни токена (например, 1 час)
    }),

    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 5,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate
    }),

    CqrsModule

  ],
  controllers: [UsersController, BlogsController, PostsController, DeleteAllsController, AuthController],
  providers: [...usersProviders, ...blogsProvides, ...postsProvedis, LoginIsExistContsraint, EmailIsExistContsraint, ...authProviders, JwtAccessStrategy],
})
export class AppModule { }

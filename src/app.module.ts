
import { MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType, DbSettingsSettingsType, EnvironmentSettingsType } from './settings/configuration';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommand, CreateUserUseCase } from './features/user/application/use-case/create-use-case';
import { GetUserUseCase } from './features/user/application/use-case/get-use-case';
import { CommentsController } from './features/comments/api/comments-controller';
import { DeleteeCommentrUseCase } from './features/comments/application/use-case/delete-use-case';
import { UpdateLikeDislikeOnCommentUseCase } from './features/comments/application/use-case/updateLileOnComment-use-case';
import { CommentsService } from './features/comments/application/commets.service';
import { CommentsQueryRepository } from './features/comments/infrastructure/comments-query-repository';
import { CommentsRepository } from './features/comments/infrastructure/comments-repository';
import { updateCommentUseCase } from './features/comments/application/use-case/update-use-case';
import { Comments, CommentSchema } from './features/comments/domain/comments.entity';
import { LikesCommentsInfo, LikesCommentsSchema } from './features/comments/domain/likes.entity';
import { LikesPostInfo, LLikesPostInfoSchema } from './features/posts/domain/likes-posts.entity';
import { LoggerMiddlewar2, LoggerMiddleware } from './utilit/middlewares/logger.middleware';
import { NameIsExistConstraint } from './utilit/decorators/transform/blogFind';
import { JwtAccessStrategy } from './utilit/strategies/jwt-auth-strategies';
import { LocalStrategy } from './utilit/strategies/local-auth-strategies';
import { UserCreatedEventHandler } from './features/user/application/event/kill';






const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository]
const useCaseUser = [CreateUserUseCase, GetUserUseCase]
const eventUser = [UserCreatedEventHandler]

const blogsProvides: Provider[] = [BlogService, BlogRepository, BlogsQueryRepository]
const postsProvedis: Provider[] = [PostsService, PostsQueryRepository, PostRepository]

const commentsProvides: Provider[] = [CommentsService, CommentsQueryRepository, CommentsRepository]
const useCaseComment: Provider[] = [DeleteeCommentrUseCase, updateCommentUseCase, UpdateLikeDislikeOnCommentUseCase]
const authProviders: Provider[] = [UsersAuthService, EmailAdapter, UsersCreatedRepository]


@Module({
  imports: [
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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Blog.name, schema: BlogSchema }, { name: Posts.name, schema: PostSchema }, { name: RecoveryPassword.name, schema: RecoveryPasswordSchema }, { name: Comments.name, schema: CommentSchema }, { name: LikesCommentsInfo.name, schema: LikesCommentsSchema }, { name: LikesPostInfo.name, schema: LLikesPostInfoSchema }]),

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
      load: [configuration]
    }),

    CqrsModule,

  ],
  controllers: [UsersController, BlogsController, PostsController, DeleteAllsController, AuthController, CommentsController],
  providers: [LoginIsExistContsraint, EmailIsExistContsraint, JwtAccessStrategy, ...usersProviders, ...blogsProvides, ...postsProvedis, ...authProviders, ...useCaseUser, ...eventUser, ...commentsProvides, ...useCaseComment, NameIsExistConstraint, LocalStrategy],
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



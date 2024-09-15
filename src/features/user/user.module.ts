import { MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { CreateUserUseCase } from './application/use-case/create-use-case';
import { GetUserUseCase } from './application/use-case/get-use-case';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/createdBy-user-Admin.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { UtilitModule } from 'src/utilit/utitli.module';
import { LoginIsExistContsraint } from './validate/login-is-exist.decorator';
import { EmailIsExistContsraint } from './validate/email-is-exist.decorator';


const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository, LoginIsExistContsraint,EmailIsExistContsraint]
const useCaseUser = [CreateUserUseCase, GetUserUseCase]




@Module({
    imports: [AuthModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]), CqrsModule, UtilitModule
    ],
    controllers: [UsersController],
    providers: [...usersProviders, ...useCaseUser],
    exports: [UsersRepository, UsersService,]
})
export class UserModule { }
import { forwardRef, Module, Provider } from '@nestjs/common';
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
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';


const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository, LoginIsExistContsraint, EmailIsExistContsraint, UsersSqlRepository, UsersSqlQueryRepository]
const useCaseUser = [CreateUserUseCase, GetUserUseCase]




@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]), CqrsModule, UtilitModule,
        forwardRef(() => AuthModule)
    ],
    controllers: [UsersController],
    providers: [...usersProviders, ...useCaseUser,],
    exports: [UsersRepository, UsersService, UsersSqlRepository, UsersSqlQueryRepository]
})
export class UserModule { }
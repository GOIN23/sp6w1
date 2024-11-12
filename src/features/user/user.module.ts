import { forwardRef, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CreateUserUseCase } from './application/use-case/create-use-case';
import { GetUserUseCase } from './application/use-case/get-use-case';
import { UsersService } from './application/users.service';
import { User, UserSchema } from './domain/createdBy-user-Admin.entity';
import { EmailConfirmation } from './domain/email.confirmation.entityT';
import { UserEnity } from './domain/entity.user.entityT';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersSqlQueryRepository } from './infrastructure/users.sql.query.repository';
import { UsersSqlRepository } from './infrastructure/users.sql.repository';
import { UsersController } from './user.controller';
import { EmailIsExistContsraint } from './validate/email-is-exist.decorator';
import { LoginIsExistContsraint } from './validate/login-is-exist.decorator';


const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository, LoginIsExistContsraint, EmailIsExistContsraint, UsersSqlRepository, UsersSqlQueryRepository]
const useCaseUser = [CreateUserUseCase, GetUserUseCase]




@Module({
    imports: [
        TypeOrmModule.forFeature([UserEnity, EmailConfirmation]),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]), CqrsModule,
        forwardRef(() => AuthModule)
    ],
    controllers: [UsersController],
    providers: [...usersProviders, ...useCaseUser,],
    exports: [UsersRepository, UsersService, UsersSqlRepository, UsersSqlQueryRepository]
})
export class UserModule { }
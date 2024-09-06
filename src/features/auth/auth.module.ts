import { MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { UsersAuthService } from './application/auth-service';
import { EmailAdapter } from './application/emai-Adapter';
import { UsersCreatedRepository } from './infrastructure/users.repository';
import { SesionsService } from './application/sesions-service';
import { AuthController } from './api/auth.controller';



const authProviders: Provider[] = [UsersAuthService, EmailAdapter, UsersCreatedRepository, SesionsService]

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [...authProviders],
    exports: []
})
export class AuthModule { }
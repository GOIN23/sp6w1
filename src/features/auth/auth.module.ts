import { MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { UsersAuthService } from './application/auth-service';
import { EmailAdapter } from './application/emai-Adapter';
import { UsersCreatedRepository } from './infrastructure/users.repository';
import { SesionsService } from './application/sesions-service';
import { AuthController } from './api/auth.controller';
import { JwtAccessStrategy } from 'src/utilit/strategies/jwt-auth-strategies';
import { LocalStrategy } from 'src/utilit/strategies/local-auth-strategies';
import { SecuritySesionsController } from '../SecurityDevices/api/devices.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '../user/domain/createdBy-user-Admin.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSesions, DeviceSesionsSchema } from './domain/sesion-auth.entity';
import { RecoveryPassword, RecoveryPasswordSchema } from './domain/recovery-password-code';
import { UtilitModule } from 'src/utilit/utitli.module';



const authProviders: Provider[] = [UsersAuthService, EmailAdapter, UsersCreatedRepository, SesionsService, JwtAccessStrategy, LocalStrategy]

@Module({
    imports: [ MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: RecoveryPassword.name, schema: RecoveryPasswordSchema }, { name: DeviceSesions.name, schema: DeviceSesionsSchema }])],
    controllers: [AuthController, SecuritySesionsController],
    providers: [...authProviders],
    exports: [EmailAdapter, UsersCreatedRepository, UsersAuthService]
})
export class AuthModule { }
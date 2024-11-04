import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshGuard } from '../../utilit/guards/refresh-auth-guard';
import { JwtAccessStrategy } from '../../utilit/strategies/jwt-auth-strategies';
import { LocalStrategy } from '../../utilit/strategies/local-auth-strategies';
import { SecuritySesionsController } from '../SecurityDevices/api/devices.controller';
import { User, UserSchema } from '../user/domain/createdBy-user-Admin.entity';
import { UserModule } from '../user/user.module';
import { AuthController } from './api/auth.controller';
import { UsersAuthService } from './application/auth-service';
import { EmailAdapter } from './application/emai-Adapter';
import { SesionsService } from './application/sesions-service';
import { RecoveryPassword, RecoveryPasswordSchema } from './domain/recovery-password-code';
import { RecoveryPassword as recoveryPasswordEntity } from './domain/recovery.password.code.entity';
import { DeviceSesions, DeviceSesionsSchema } from './domain/sesion-auth.entity';
import { SesionEntity } from './domain/sesion.auth.entity';
import { UsersAuthSqlRepository } from './infrastructure/auth.sql.repository';
import { UsersCreatedRepository } from './infrastructure/users.repository';




const authProviders: Provider[] = [UsersAuthService, EmailAdapter, UsersCreatedRepository, SesionsService, UsersAuthSqlRepository, JwtAccessStrategy, LocalStrategy, RefreshGuard]

@Module({
    imports: [TypeOrmModule.forFeature([recoveryPasswordEntity, SesionEntity]), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: RecoveryPassword.name, schema: RecoveryPasswordSchema }, { name: DeviceSesions.name, schema: DeviceSesionsSchema }]), UserModule,],
    controllers: [AuthController, SecuritySesionsController],
    providers: [...authProviders],
    exports: [EmailAdapter, UsersCreatedRepository, UsersAuthService, JwtAccessStrategy, LocalStrategy, RefreshGuard]
})
export class AuthModule { }
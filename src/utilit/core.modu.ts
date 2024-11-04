import { Global, Module, Provider } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./guards/basic-auth-guards";
import { JwtAuthGuard } from "./guards/jwt-auth-guards";
import { LoggingInterceptor } from "./interceptors/login-inte";
import { NumberPipe } from "./pipe/number.pipe";








const gurd: Provider[] = [AuthGuard, JwtAuthGuard]
const interceprot: Provider[] = [LoggingInterceptor]
const pipe: Provider[] = [NumberPipe]



@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: 'your_secret_key', // Замените на ваш секретный ключ
            signOptions: { expiresIn: '5m' }, // Время жизни токена (например, 1 час)
        }),
        CqrsModule,
    ],
    providers: [...gurd, ...interceprot, ...pipe],
    exports: [JwtModule, CqrsModule, ...gurd, ...interceprot, ...pipe]
})
export class CoreModule { }
import { forwardRef, Module, Provider } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../features/auth/auth.module";
import { AuthGuard } from "./guards/basic-auth-guards";
import { JwtAuthGuard } from "./guards/jwt-auth-guards";
import { RefreshGuard } from "./guards/refresh-auth-guard";
import { LoggingInterceptor } from "./interceptors/login-inte";
import { NumberPipe } from "./pipe/number.pipe";
import { JwtAccessStrategy } from "./strategies/jwt-auth-strategies";
import { LocalStrategy } from "./strategies/local-auth-strategies";





const gurd: Provider[] = [AuthGuard, JwtAuthGuard, RefreshGuard]
const interceprot: Provider[] = [LoggingInterceptor]
const pipe: Provider[] = [NumberPipe]
const strategy: Provider[] = [JwtAccessStrategy, LocalStrategy]







@Module({
    imports: [JwtModule, forwardRef(() => AuthModule)],
    providers: [...gurd, ...interceprot, ...pipe, ...strategy],
    exports: [...gurd, ...interceprot, ...pipe, ...strategy],

})
export class UtilitModule {

}
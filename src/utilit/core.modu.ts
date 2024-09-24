import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";








@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: 'your_secret_key', // Замените на ваш секретный ключ
            signOptions: { expiresIn: '10s' }, // Время жизни токена (например, 1 час)
        })
    ],
    exports: [JwtModule]
})
export class CoreModule { }
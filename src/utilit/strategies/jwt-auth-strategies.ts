import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { use } from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersAuthService } from "src/features/auth/application/auth-service";
@Injectable()

export class JwtAccessStrategy extends PassportStrategy(Strategy) {
    constructor(protected usersAuthService: UsersAuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'your_secret_key',

        })
    }

    async validate(payload: any) {
        const user = await this.usersAuthService.findUsers(payload.sub); // Предположим, у вас есть метод findById
        if (!user) {
            throw new UnauthorizedException();
        }

        const outputData = {
            email: user.email,
            login: user.login,
            userId: payload.sub

        }
        return outputData
    }


}
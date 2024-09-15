import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersAuthService } from "../../features/auth/application/auth-service"
import { use } from "passport";

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
        const user = await this.usersAuthService.findUsers(payload.userId); // Предположим, у вас есть метод findById
        if (!user) {
            throw new UnauthorizedException();
        }


        return {
            email: user.email,
            login: user.login,
            userId: user._id
        }
    }


}


export class JwtAuthGuardPassport extends AuthGuard('jwt') { }

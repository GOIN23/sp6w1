import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UsersAuthService } from "../../features/auth/application/auth-service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private usersAuthService: UsersAuthService) {
        super({ usernameField: 'loginOrEmail' });
    }

    async validate(loginOrEmail: string, password: string): Promise<any> {
        const user = await this.usersAuthService.checkCreadentlais(loginOrEmail, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

export class LocalAuthGuard extends AuthGuard('local') { }

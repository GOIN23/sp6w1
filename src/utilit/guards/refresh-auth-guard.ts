import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersAuthService } from "../../features/auth/application/auth-service";

@Injectable()
export class RefreshGuard implements CanActivate {
    constructor(protected usersService: UsersAuthService) { }
    async canActivate(context: ExecutionContext,): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const result = await this.usersService.checkRefreshToken(request.cookies.refreshToken)


        if (!result) {
            throw new UnauthorizedException()
        }

        return true

    }
}
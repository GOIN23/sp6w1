import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

// Custom guard
// https://docs.nestjs.com/guards




@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();


        try {
            
            const authorization = request.headers?.authorization;


            if (!authorization) {
                throw new UnauthorizedException()
            }

            const encodeString = authorization.split(" ")

            const firstPart = encodeString[0]

            const lastPart = encodeString[1]


            if (firstPart !== "Basic") {
                throw new UnauthorizedException()
            }


            const bytes = Buffer.from(lastPart, "base64").toString("ascii")

            const credentials = "admin:qwerty"

            if (bytes !== credentials) {
                throw new UnauthorizedException()
            }

            
            return true

        } catch (error) {
            throw new UnauthorizedException()
        }

    }
}
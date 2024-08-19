import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Access token not found');
        }

        const token = authHeader.split(' ')[1]; // Извлекаем токен

        try {
            const payload = this.jwtService.verify(token); // Верифицируем токен
            request.user = payload; // Сохраняем информацию о пользователе в запрос
            return true; // Разрешаем доступ
        } catch (error) {
            throw new UnauthorizedException('Invalid access token');
        }
    }
}

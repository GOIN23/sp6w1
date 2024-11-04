import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Request, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { SkipThrottle } from "@nestjs/throttler";
import { Response } from 'express';
import { LocalAuthGuard } from "../../../utilit/strategies/local-auth-strategies";
import { UserCreateModel } from "../../user/models/input/create-user.input.model";
import { UsersAuthService } from "../application/auth-service";
import { SesionsService } from "../application/sesions-service";
import { EmailInputeModel } from "./models/input/email-user.input.models";
import { NewPasswordInputeModel } from "./models/input/new-password.models";



@Controller('auth')
export class AuthController {
    constructor(protected authService: UsersAuthService, protected sesionsService: SesionsService) { }

    @Post("registration")
    @HttpCode(204)
    async registerUser(@Body() createModel: UserCreateModel) {

        await this.authService.creatUser(createModel)

    }

    @Post("login")
    @UseGuards(LocalAuthGuard) //Только в этом месте я использовал pasportLocal
    @HttpCode(200)
    async login(@Res() res: Response, @Request() req) {

        const userAgent = req.headers["user-agent"] || 'unknown device';
        const token = await this.authService.login({ userId: req.user._id, login: req.user.login, userAgent: userAgent, ip: req.ip })


        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true, // Доступно только по HTTP(S), недоступно через JavaScript
            secure: true, // Установите в true, если используете HTTPS
            maxAge: 30 * 24 * 60 * 60 * 1000, // Пример: 30 дней
        });

        return res.json({ accessToken: token.accessToken });
    }
    @Post("logout")
    @HttpCode(204)
    async logout(@Request() req) {

        const result = await this.authService.checkRefreshToken(req.cookies.refreshToken)






        if (!result) {
            throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)
        }

        await this.sesionsService.completelyRemoveSesion(result);

    }

    @Post("refresh-token")
    @HttpCode(200)
    async refreshToken(@Res() res: Response, @Request() req) {

        const result = await this.authService.checkRefreshToken(req.cookies.refreshToken)


        if (!result) {
            throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)
        }

        const userAgent = req.headers["user-agent"];

        const tokens = await this.authService.updateToken(result, req.ip, userAgent);


        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true, // Доступно только по HTTP(S), недоступно через JavaScript
            secure: true, // Установите в true, если используете HTTPS
            sameSite: 'strict', // Защищает от CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // Пример: 30 дней
        });

        return res.json({ accessToken: tokens.accessToken });

    }


    @Post("registration-confirmation")
    @HttpCode(204)
    async registrationConfirmation(@Body("code") code: string) {
        const user = await this.authService.confirmEmail(code);
        if (!user) {
            throw new HttpException({
                message: [
                    { message: 'User not found', field: 'code' },
                ]
            }, HttpStatus.BAD_REQUEST);
        }

    }


    @SkipThrottle({ default: false })
    @Post("registration-email-resending")
    @HttpCode(204)
    async registrationEmailResending(@Body("email") email: string, @Request() req) {




        const res = await this.authService.resendingCode(email)


        if (!res) {
            throw new HttpException({
                message: [
                    { message: 'User not found', field: 'email' },
                ]
            }, HttpStatus.BAD_REQUEST);

        }

    }


    @Post("password-recovery")
    @HttpCode(204)
    async passwordRecovery(@Body() emailRes: EmailInputeModel) {
        const { email } = emailRes
        await this.authService.passwordRecovery(email)
    }


    @Post("new-password")
    @HttpCode(204)
    async newPassword(@Body() inputNewData: NewPasswordInputeModel) {
        const result = await this.authService.checkPasswordRecovery(inputNewData.recoveryCode, inputNewData.newPassword);

        if (!result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }
    }
    @SkipThrottle({ default: false })
    @Get("me")
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(200)
    async me(@Request() req) {
        return req.user
    }

}


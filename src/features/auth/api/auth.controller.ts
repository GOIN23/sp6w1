import { CustomException } from '../../../utilit/custom/newCUS';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Request, Res, UseFilters, UseGuards } from "@nestjs/common";
import { UserCreateModel } from "src/features/user/models/input/create-user.input.model";
import { UserOutputModel } from "src/features/user/models/output/user.output.model";
import { LoginUserCreateModel } from "./models/input/login-user.input.models";
import { UsersAuthService } from "../application/auth-service";
import { EmailInputeModel } from "./models/input/email-user.input.models";
import { NewPasswordInputeModel } from "./models/input/new-password.models";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { Response } from 'express';



@Controller('auth')
export class AuthController {
    constructor(protected usersService: UsersAuthService) { }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("registration")
    @HttpCode(204)
    async registerUser(@Body() createModel: UserCreateModel) {

        await this.usersService.creatUser(createModel)

    }

    @Post("login")
    @HttpCode(200)
    async login(@Body() inputLoginModel: LoginUserCreateModel, @Res() res: Response) {
        const user = await this.usersService.checkCreadentlais(inputLoginModel.loginOrEmail, inputLoginModel.password);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }



        const token = await this.usersService.login({ userId: user._id, login: user.login })

        res.cookie('refreshToken', token.refreshToken, {
            httpOnly: true, // Доступно только по HTTP(S), недоступно через JavaScript
            secure: true, // Установите в true, если используете HTTPS
            sameSite: 'strict', // Защищает от CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // Пример: 30 дней
        });

        return res.json({ accessToken: token.accessToken });
    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("registration-confirmation")
    @HttpCode(204)
    async registrationConfirmation(@Body("code") code: string) {
        const user = await this.usersService.confirmEmail(code);
        if (!user) {
            throw new HttpException({
                message: [
                    { message: 'User not found', field: 'code' },
                ]
            }, HttpStatus.BAD_REQUEST);
        }

    }

 

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("registration-email-resending")
    @HttpCode(204)
    async registrationEmailResending(@Body("email") email: string) {
        const res = await this.usersService.resendingCode(email)

        if (!res) {
            throw new HttpException({
                message: [
                    { message: 'User not found', field: 'code' },
                ]
            }, HttpStatus.BAD_REQUEST);

        }

    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("password-recovery")
    @HttpCode(204)
    async passwordRecovery(@Body() emailRes: EmailInputeModel) {
        const { email } = emailRes
        await this.usersService.passwordRecovery(email)
    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("new-password")
    @HttpCode(204)
    async newPassword(@Body() inputNewData: NewPasswordInputeModel) {
        const result = await this.usersService.checkPasswordRecovery(inputNewData.recoveryCode, inputNewData.newPassword);

        if (!result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }
    }

    @Get("me")
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(200)
    async me(@Request() req) {

        return req.user
    }

}


import { CustomException } from '../../../utilit/custom/newCUS';
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Request, UseFilters, UseGuards } from "@nestjs/common";
import { UserCreateModel } from "src/features/user/models/input/create-user.input.model";
import { UserOutputModel } from "src/features/user/models/output/user.output.model";
import { LoginUserCreateModel } from "./models/input/login-user.input.models";
import { UsersAuthService } from "../application/auth-service";
import { Matches } from "class-validator";
import { EmailInputeModel } from "./models/input/email-user.input.models";
import { NewPasswordInputeModel } from "./models/input/new-password.models";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { Httpsds } from 'src/utilit/exception-filters/http-exception-filter';



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
    async login(@Body() inputLoginModel: LoginUserCreateModel) {
        const user = await this.usersService.checkCreadentlais(inputLoginModel.loginOrEmail, inputLoginModel.password);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }



        const tokin = await this.usersService.login({ userId: user._id, login: user.login })

        return tokin
    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("registration-confirmation")
    @UseFilters(new Httpsds())
    @HttpCode(204)
    async registrationConfirmation(@Body("code") code: string) {
        const user = await this.usersService.confirmEmail(code);
        if (!user) {
            throw new HttpException({
                errorsMessages: [
                    { message: 'User not found', field: 'code' },
                ],
            }, HttpStatus.BAD_REQUEST);
        }

    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("registration-email-resending")
    @UseFilters(new Httpsds())
    @HttpCode(204)
    async registrationEmailResending(@Body("email") email: string) {
        const res = await this.usersService.resendingCode(email)

        if (!res) {
            throw new HttpException({
                errorsMessages: [
                    { message: 'User not found', field: 'email' },
                ],
            }, HttpStatus.BAD_REQUEST);

        }

    }

    @Throttle({ default: { limit: 5, ttl: 10000 } })
    @Post("password-recovery")
    @HttpCode(204)
    async passwordRecovery(@Body() emailRes: EmailInputeModel) {
        debugger
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


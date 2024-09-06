import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Req, Request, Res, UseFilters, UseGuards } from "@nestjs/common";
import { SkipThrottle, Throttle } from "@nestjs/throttler";
import { SesionsService } from "src/features/auth/application/sesions-service";
import { UsersAuthService } from "src/features/auth/application/auth-service";


@SkipThrottle()
@Controller('security')
export class SecuritySesionsController {
    constructor(protected usersAuthService: UsersAuthService, protected sesionsService: SesionsService) { }


    @Get("devices")
    @HttpCode(200)
    async getDevices(@Request() req,) {

        const result = await this.usersAuthService.checkRefreshToken(req.cookies.refreshToken)

        if (!result) {
            throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)

        }
        const sesions = await this.sesionsService.getSesions(result);



        return sesions

    }

    @Delete("devices")
    @HttpCode(204)
    async deleteDevices(@Request() req,) {
        const result = await this.usersAuthService.checkRefreshToken(req.cookies.refreshToken)

        if (!result) {
            throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)

        }
        await this.sesionsService.deleteSesions(result);

    }

    @Delete("devices/:id")
    @HttpCode(204)
    async deleteByIdDevices(@Param("id") id: string, @Request() req,) {
        const result = await this.usersAuthService.checkRefreshToken(req.cookies.refreshToken)

        if (!result) {
            throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED)

        }

        const sesionDevice = await this.sesionsService.getSesionsId(id);

        if (!sesionDevice) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        const sesions = await this.sesionsService.getSesions(result);
        const resulDevaId = sesions?.find((s) => s.deviceId === id);

        if (!resulDevaId) {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);

        }

        await this.sesionsService.deleteSesionsId(id);

    }

}


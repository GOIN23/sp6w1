import { JwtService } from '@nestjs/jwt';
import { Injectable } from "@nestjs/common";
import { UsersCreatedRepository } from "../infrastructure/users.repository";




@Injectable()
export class SesionsService {
    constructor(protected repositryAuth: UsersCreatedRepository, protected jwtService: JwtService) { }
    async creatSesion(userSession: any) {
        await this.repositryAuth.addSesionUser(userSession);
    }
    async updateSesion(iat: string, userId: string, diveceId: string) {
        await this.repositryAuth.updateSesionUser(iat, userId, diveceId);
    }
    async getSesions(payload: any) {
        const sesions = await this.repositryAuth.getSesions(payload.userId);

        return sesions;

    }
    async getSesionsId(deviceId: string) {
        const sesion = await this.repositryAuth.getSesionsId(deviceId)

        return sesion
    }
    async completelyRemoveSesion(payload: any) {
        try {
            const sesions = await this.repositryAuth.completelyRemoveSesion(payload.deviceId, payload.userId);

            return sesions;
        } catch (error) {
            return null;
        }
    }
    async deleteSesions(payload: any) {
        const sesions = await this.repositryAuth.deleteSesions(payload.deviceId);

        return sesions;

    }
    async deleteSesionsId(deviceId: string) {

        await this.repositryAuth.deleteSesionsId(deviceId);

        return true;
    }
}
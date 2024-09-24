import { JwtService } from '@nestjs/jwt';
import { Injectable } from "@nestjs/common";
import { UsersCreatedRepository } from "../infrastructure/users.repository";
import { UsersAuthSqlRepository } from '../infrastructure/auth.sql.repository';




@Injectable()
export class SesionsService {
    constructor(protected repositryAuth: UsersCreatedRepository, protected jwtService: JwtService, protected usersAuthSqlRepository: UsersAuthSqlRepository) { }
    async creatSesion(userSession: any) {
        await this.usersAuthSqlRepository.addSesionUser(userSession);
    }
    async updateSesion(iat: string, userId: string, diveceId: string) {
        await this.usersAuthSqlRepository.updateSesionUser(iat, userId, diveceId);
    }
    async getSesions(payload: any) {
        const sesions = await this.usersAuthSqlRepository.getSesions(payload.userId);

        return sesions;

    }
    async getSesionsId(deviceId: string) {
        const sesion = await this.usersAuthSqlRepository.getSesionsId(deviceId)

        return sesion
    }
    async completelyRemoveSesion(payload: any) {
        try {
            const sesions = await this.usersAuthSqlRepository.completelyRemoveSesion(payload.deviceId, payload.userId);

            return sesions;
        } catch (error) {
            return null;
        }
    }
    async deleteSesions(payload: any,) {
        await this.usersAuthSqlRepository.deleteSesions(payload.deviceId,payload.userId);


    }
    async deleteSesionsId(deviceId: string) {

        await this.usersAuthSqlRepository.deleteSesionsId(deviceId);

        return true;
    }
}
import { Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { UsersCreatedRepository } from "../infrastructure/users.repository";
import * as bcrypt from 'bcrypt';
import { add } from "date-fns";
import { randomUUID } from "crypto";
import { EmailAdapter } from "./emai-Adapter";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../user/domain/createdBy-user-Admin.entity"
import { UserCreateModel } from "../../user/models/input/create-user.input.model"
import { SesionsService } from "./sesions-service";
import { DeviceSesions } from "../domain/sesion-auth.entity";



// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersAuthService {
    constructor(private usersRepository: UsersCreatedRepository, protected emailAdapter: EmailAdapter, protected jwtService: JwtService, protected sesionsService: SesionsService) { }

    async creatUser(userData: UserCreateModel): Promise<void> {
        const passwordSalt = await bcrypt.genSalt(10);

        const passwordHash = await this._generatHash(userData.password, passwordSalt);

        const newUser: User = {
            login: userData.login,
            passwordHash,
            passwordSalt,
            email: userData.email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                // доп поля необходимые для подтверждения
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                }),
                isConfirmed: false,
            },
        };



        await this.usersRepository.createUsers(newUser);

        this.emailAdapter.sendEmail(newUser.emailConfirmation.confirmationCode, newUser.email);



    }
    async login(user: any) {
        const deviceId: string = new ObjectId().toString()
        const payload = { userLogin: user.login, userId: user.userId, deviceId: deviceId };
        const tokens = { accessToken: this.jwtService.sign(payload), refreshToken: this.jwtService.sign(payload, { expiresIn: "20s" }) }

        const userSession: DeviceSesions = {
            userId: user.userId,
            deviceId: deviceId,
            lastActiveDate: this.jwtService.decode(tokens.refreshToken).iat,
            ip: user.ip,
            title: user.userAgent,
        };

        await this.sesionsService.creatSesion(userSession)


        return tokens
    }
    async checkCreadentlais(loginOrEmail: string, password: string) {
        const user = await this.usersRepository.findBlogOrEmail(loginOrEmail);
        if (!user) return false;

        const passwordHash = await this._generatHash(password, user.passwordSalt);

        if (user.passwordHash !== passwordHash) {
            return false;
        }

        return user;
    }
    async _generatHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }
    async confirmEmail(code: string) {
        const user: any = await this.usersRepository.findUserByConfirEmail(code);

        if (!user) {
            return null;
        }
        if (user.emailConfirmation.confirmationCode === code && user.emailConfirmation.expirationDate > new Date()) {
            const result = await this.usersRepository.updateConfirmation(user._id);

            return result;
        }

        return null;
    }
    async resendingCode(email: string) {
        const user = await this.usersRepository.findBlogOrEmail(email);

        if (!user) {
            return null;
        }

        if (user.emailConfirmation.isConfirmed) {
            return null;
        }
        const newCode = randomUUID();
        await this.usersRepository.updateCodeUserByConfirEmail(user._id, newCode);

        this.emailAdapter.sendEmail(newCode, email);

        return true;
    }
    async passwordRecovery(email: string) {
        const passwordRecoveryCode = randomUUID();


        await this.usersRepository.postPasswordRecoveryCode(passwordRecoveryCode, email);

        try {
            await this.emailAdapter.sendEmail("null", email, passwordRecoveryCode);
            return passwordRecoveryCode
        } catch (e) {
            console.log(e);
            return e
        }
    }
    async checkPasswordRecovery(code: any, newPassword: string) {
        const result = await this.usersRepository.checkPasswordRecoveryCode(code);

        if (!result) {
            return false;
        }
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generatHash(newPassword, passwordSalt);

        await this.usersRepository.updatePassword(result.email, passwordHash, passwordSalt);

        return true;
    }
    async findUsers(id: string | undefined) {
        const res = await this.usersRepository.findUsers(id);

        return res;
    }
    async checkRefreshToken(refreshToken: string) {
        try {
            const result: any = await this.jwtService.verify(refreshToken);
            const checkSesionshToken = await this.usersRepository.findRottenSessions(result.userId, result.deviceId);


            if (!checkSesionshToken) {
                return null;
            }
            if (result.iat < checkSesionshToken!.lastActiveDate) {
                return null;
            }

            return await this.jwtService.decode(refreshToken);
        } catch (error) {
            return null;
        }
    }
    async updateToken(payload: any, ip: string | undefined, title: string | undefined) {

        const body = { userLogin: payload.userLogin, userId: payload.userId, deviceId: payload.deviceId };

        const tokens = { accessToken: this.jwtService.sign(body), refreshToken: this.jwtService.sign(body, { expiresIn: "20s" }) }


        await this.sesionsService.updateSesion(this.jwtService.decode(tokens.refreshToken).iat, payload.userId, payload.deviceId);

        return tokens

    }

}
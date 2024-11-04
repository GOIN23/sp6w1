import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../../user/domain/createdBy-user-Admin.entity";
import { UsersSqlRepository } from "../../user/infrastructure/users.sql.repository";
import { UserCreateModel } from "../../user/models/input/create-user.input.model";
import { DeviceSesions } from "../domain/sesion-auth.entity";
import { UsersAuthSqlRepository } from "../infrastructure/auth.sql.repository";
import { UsersCreatedRepository } from "../infrastructure/users.repository";
import { EmailAdapter } from "./emai-Adapter";
import { SesionsService } from "./sesions-service";




// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersAuthService {
    constructor(private usersRepository: UsersCreatedRepository, protected emailAdapter: EmailAdapter, protected jwtService: JwtService, protected sesionsService: SesionsService, protected usersSqlRepository: UsersSqlRepository, protected usersAuthSqlRepository: UsersAuthSqlRepository) { }

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



        await this.usersSqlRepository.creatInDbUser(newUser);

        this.emailAdapter.sendEmail(newUser.emailConfirmation.confirmationCode, newUser.email);



    }
    async login(user: any) {
        const deviceId = uuidv4();

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

        const user = await this.usersAuthSqlRepository.findBlogOrEmail(loginOrEmail);
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

        const user: any = await this.usersSqlRepository.findUserByConfirEmail(code)



        if (!user) {
            return null;
        }

        if (user.isConfirmed) {
            return null
        }
        const expirationDate = new Date(user.expirationDate);

        if (user.confirmationCode === code && expirationDate > new Date()) {
            const result = await this.usersSqlRepository.updateConfirmation(user.user.userId);

            return result;
        }

        return null;
    }
    async resendingCode(email: string) {
        const user = await this.usersSqlRepository.findBlogOrEmail(email);

        if (!user) {
            return false
        }

        if (user.isConfirmed) {
            return false

        }

        const newCode = randomUUID();
        await this.usersSqlRepository.updateCodeUserByConfirEmail(user._id, newCode);


        this.emailAdapter.sendEmail(newCode, email);



        return true;
    }
    async passwordRecovery(email: string) {
        const passwordRecoveryCode = randomUUID();


        await this.usersAuthSqlRepository.postPasswordRecoveryCode(passwordRecoveryCode, email);

        this.emailAdapter.sendEmail("null", email, passwordRecoveryCode);
        return passwordRecoveryCode

    }
    async checkPasswordRecovery(code: any, newPassword: string) {
        const result = await this.usersAuthSqlRepository.checkPasswordRecoveryCode(code);

        if (!result) {
            return false;
        }
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generatHash(newPassword, passwordSalt);

        await this.usersSqlRepository.updatePassword(result.email, passwordHash, passwordSalt);

        return true;
    }
    async findUsers(id: string | undefined) {
        const res = await this.usersSqlRepository.findinDbUser(id);

        return res;
    }
    async checkRefreshToken(refreshToken: string) {
        debugger

        try {
            const result: any = await this.jwtService.verify(refreshToken);
            const checkSesionshToken = await this.usersAuthSqlRepository.findRottenSessions(+result.userId, result.deviceId);


            if (!checkSesionshToken) {
                return null;
            }
            if (result.iat < checkSesionshToken.lastActiveDate) {
                return null;
            }

            return await this.jwtService.decode(refreshToken);
        } catch (error) {
            return null;
        }
    }
    async updateToken(payload: any, ip: string | undefined, title: string | undefined) {

        const body = { userLogin: payload.userLogin, userId: payload.userId, deviceId: payload.deviceId };

        const tokens = { accessToken: this.jwtService.sign(body), refreshToken: this.jwtService.sign(body, { expiresIn: "6m" }) }


        await this.sesionsService.updateSesion(this.jwtService.decode(tokens.refreshToken).iat, payload.userId, payload.deviceId);

        return tokens

    }
    async findUserByEmailOrLogin(emailOrLogin: string) {
        const user = await this.usersAuthSqlRepository.findBlogOrEmail(emailOrLogin);

        if (!user) {
            return null
        }

        return user

    }
    async checkingNumberRequests(metaData: any) {
        const data = new Date(metaData.date.getTime() - 10000);
        const result = await this.usersSqlRepository.checkingNumberRequests(metaData, data);

        console.log(result, "ratelimit ratelimit ratelimit ratelimit ratelimit")
        return result;

    }
    async addRateLlimit(metaData: any) {
        await this.usersSqlRepository.addRateLlimit(metaData);
    }

}
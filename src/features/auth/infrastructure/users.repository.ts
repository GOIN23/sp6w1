import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from "../../user/domain/createdBy-user-Admin.entity"
import { userDb } from '../../user/type/userType';
import { RecoveryPassword } from '../domain/recovery-password-code';
import { DeviceSesions } from '../domain/sesion-auth.entity';


@Injectable()
export class UsersCreatedRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>, @InjectModel(RecoveryPassword.name) private recoveryPassword: Model<RecoveryPassword>, @InjectModel(DeviceSesions.name) private deviceSesions: Model<DeviceSesions>) { }


    async createUsers(newUser: User): Promise<void> {
        await this.userModel.insertMany(newUser);
    }

    async findUsers(id: string | undefined) {
        const result = await this.userModel.findOne({ _id: id });
        if (!result) {
            return null;
        }
        return result;
    }

    async findBlogOrEmail(loginOrEmail: string): Promise<userDb | null> {
        const user = await this.userModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });


        if (!user) {
            return null
        }

        return {
            _id: user._id.toString(),
            createdAt: user.createdAt,
            email: user.email,
            login: user.login,
            passwordHash: user.passwordHash,
            passwordSalt: user.passwordSalt,
            emailConfirmation: {
                confirmationCode: user.emailConfirmation.confirmationCode,
                expirationDate: user.emailConfirmation.expirationDate,
                isConfirmed: user.emailConfirmation.isConfirmed
            }
        };
    }

    async findUserByConfirEmail(code: string) {
        const user = await this.userModel.findOne({ "emailConfirmation.confirmationCode": code });

        return user;
    }

    async updateConfirmation(id: string) {
        const user = await this.userModel.updateOne({ _id: id }, { $set: { "emailConfirmation.isConfirmed": true } });

        return user.modifiedCount === 1;
    }

    async updateCodeUserByConfirEmail(userID: string, code: string) {
        const user = await this.userModel.updateOne({ _id: userID }, { $set: { "emailConfirmation.confirmationCode": code } });

        return user;
    }

    async postPasswordRecoveryCode(code: string, email: string) {
        try {
            await this.recoveryPassword.insertMany({ code: code, email: email });
        } catch (error) {
            console.log(error);
        }
    }

    async checkPasswordRecoveryCode(code: string) {
        const result = await this.recoveryPassword.findOne({ code: code });
        return result;
    }

    async updatePassword(email: string, newPasswordHash: string, newPasswordSalt: string): Promise<void> {
        await this.userModel.updateOne({ email: email }, { $set: { passwordHash: newPasswordHash, passwordSalt: newPasswordSalt } });
    }

    async addSesionUser(userSession: DeviceSesions) {
        await this.deviceSesions.insertMany(userSession);
    }

    async findRottenSessions(userId: string, deviceId: string) {
        const userSesion = await this.deviceSesions.findOne({
            userId: userId,
            deviceId: deviceId,
        });

        return userSesion;
    }

    async completelyRemoveSesion(deviceId: string, userId: string) {
        await this.deviceSesions.deleteOne({ deviceId: deviceId, userId: userId });
    }

    async updateSesionUser(iat: string, userId: string, diveceId: string) {
        await this.deviceSesions.updateOne({ userId: userId, deviceId: diveceId }, { $set: { lastActiveDate: iat } });
    }
    async getSesions(userId: string) {
        const sesionsDivece = await this.deviceSesions.find({ userId: userId });
        const mapDateSesio = sesionsDivece.map((d) => {
            return {
                deviceId: d.deviceId,
                ip: d.ip,
                lastActiveDate: new Date(+d.lastActiveDate * 1000),
                title: d.title,
            };
        });
        return mapDateSesio;
    }
    async getSesionsId(deviceId: string) {
        const sesionsDivece = await this.deviceSesions.findOne({ deviceId: deviceId });
        return sesionsDivece;
    }

    async deleteSesions(deviceId: string) {
        await this.deviceSesions.deleteMany({ deviceId: { $ne: deviceId } });
    }
    async deleteSesionsId(deviceId: string) {
        await this.deviceSesions.deleteOne({ deviceId: deviceId });
    }
}

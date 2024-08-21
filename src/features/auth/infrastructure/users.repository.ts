import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from "../../user/domain/createdBy-user-Admin.entity"
import { userDb } from '../../user/type/userType';
import { RecoveryPassword } from '../domain/recovery-password-code';


@Injectable()
export class UsersCreatedRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>, @InjectModel(RecoveryPassword.name) private recoveryPassword: Model<RecoveryPassword>) { }


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
}

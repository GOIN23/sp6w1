import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/createdBy-user-Admin.entity';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';


@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>, protected dataSource: DataSource) { }
    public async creatInDbUser(user: User) {
        const result: UserDocument[] = await this.userModel.insertMany(user);
        return result[0]._id.toString();
    }
    async findinDbUser(id: string) {
        try {
            const user = await this.userModel.findOne({ _id: id })
            return user

        } catch (error) {
            return null
        }

    }
    async findIsLogin(login: string) {
        const loginUser = await this.userModel.findOne({ login: login })

        return loginUser
    }

    async findIsEmail(email: string) {
        const emailUser = await this.userModel.findOne({ email: email })

        return emailUser
    }
    async deletUser(id: string) {
        await this.userModel.deleteOne({ _id: id })

    }
}

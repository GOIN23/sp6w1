import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/createdBy-user-Admin.entity';
import { Model } from 'mongoose';
import { UserOutputModel } from '../models/output/user.output.model';


@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    public async creatInDbUser(user: User) {
        const result: UserDocument[] = await this.userModel.insertMany(user);
        return result[0]._id.toString();
    }
    async findinDbUser(id: string) {
        const user = await this.userModel.findById(id, { __v: false })

        return user
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
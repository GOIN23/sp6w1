import { Injectable } from '@nestjs/common';
import { User, UserDocument } from "../domain/createdBy-user-Admin.entity";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserOutputModel, UserOutputModelMapper } from '../models/output/user.output.model';
import { qureT } from 'src/utilit/TYPE/generalType';
import { PaginatorUsers, UserViewModel2, UserViewModelConfidential } from 'src/utilit/TYPE/typeUser';
import { SortDirection } from 'mongodb';
import { QueryParamsDto } from 'src/utilit/dto/dto.query.user';


@Injectable()
export class UsersQueryRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    async getById(userId: string): Promise<UserOutputModel> {
        const user = await this.userModel.findOne({ _id: userId })
        return UserOutputModelMapper(user);
    }

    async getUsers(query: QueryParamsDto): Promise<PaginatorUsers | { error: string }> {
        const filter = {
            $or: [
                { email: { $regex: query.searchEmailTerm ?? "", $options: "i" } },
                { login: { $regex: query.searchLoginTerm ?? "", $options: "i" } }
            ],
        };


        try {
            const items: UserViewModelConfidential[] = await this.userModel.find(filter)
                .sort({ [query.sortBy]: query.sortDirection as SortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize).lean()

            const userMapData: UserViewModel2[] = items.map((user: UserViewModelConfidential) => {
                return {
                    id: user._id,
                    login: user.login,
                    email: user.email,
                    createdAt: user.createdAt,
                };
            });
            const totalCount = await this.userModel.countDocuments(filter);
            return {
                pagesCount: +Math.ceil(totalCount / query.pageSize),
                page: +query.pageNumber,
                pageSize: +query.pageSize,
                totalCount: +totalCount,
                items: userMapData,
            };
        } catch (e) {
            console.log(e);
            return { error: "some error" };
        }
    }
}



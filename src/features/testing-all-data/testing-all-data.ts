import { Controller, Delete, HttpCode } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Posts } from "../posts/domain/posts.entity";
import { User } from "../user/domain/createdBy-user-Admin.entity";
import { Blog } from "../blogs/domain/blog.entity";
import { RecoveryPassword } from "../auth/domain/recovery-password-code";







@Controller('testing')
export class DeleteAllsController {
    constructor(@InjectModel(Posts.name) private postModel: Model<Posts>, @InjectModel(Blog.name) private blogModel: Model<Blog>, @InjectModel(User.name) private userModel: Model<User>, @InjectModel(RecoveryPassword.name) private RecoveryPassword: Model<RecoveryPassword>) { }

    @Delete("all-data")
    @HttpCode(204)
    async delete() {
        await this.postModel.deleteMany()
        await this.blogModel.deleteMany()
        await this.userModel.deleteMany()
        await this.RecoveryPassword.deleteMany()

    }

}

import { Controller, Delete, HttpCode } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RecoveryPassword } from "../auth/domain/recovery-password-code";
import { Comments } from "../content/comments/domain/comments.entity";
import { LikesCommentsInfo } from "../content/comments/domain/likes.entity";
import { SkipThrottle } from "@nestjs/throttler";
import { Posts } from "../content/posts/domain/posts.entity";
import { User } from "../user/domain/createdBy-user-Admin.entity";
import { Blog } from "../content/blogs/domain/blog.entity";
import { LikesPostInfo } from "../content/posts/domain/likes-posts.entity";
import { DataSource } from "typeorm";





@SkipThrottle({ default: false })
@Controller('testing')
export class DeleteAllsController {
    constructor(protected dataSource: DataSource) { }

    @Delete("all-data")
    @HttpCode(204)
    async delete() {
        const queryuDeleteMany = `
        TRUNCATE TABLE users RESTART IDENTITY CASCADE;
        TRUNCATE TABLE email_confirmation RESTART IDENTITY CASCADE;
        TRUNCATE TABLE device_sesions RESTART IDENTITY CASCADE;
        TRUNCATE TABLE recovery_password RESTART IDENTITY CASCADE; 
  `

        await this.dataSource.query(queryuDeleteMany)



    }

}


//    DELETE FROM email_confirmation;
// DELETE FROM device_sesions;
// DELETE FROM recovery_password;  
// DELETE FROM users;
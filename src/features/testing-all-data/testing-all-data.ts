import { Controller, Delete, HttpCode } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
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
        TRUNCATE TABLE blogs RESTART IDENTITY CASCADE; 
        TRUNCATE TABLE posts RESTART IDENTITY CASCADE; 
        TRUNCATE TABLE comments RESTART IDENTITY CASCADE;
        TRUNCATE TABLE likes_info_comments RESTART IDENTITY CASCADE;
        TRUNCATE TABLE likes_info_posts RESTART IDENTITY CASCADE;

  `

        await this.dataSource.query(queryuDeleteMany)



    }

}


//    DELETE FROM email_confirmation;
// DELETE FROM device_sesions;
// DELETE FROM recovery_password;
// DELETE FROM users;
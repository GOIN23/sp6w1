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
        TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "emailConfirmation" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "deviceSesions" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "recoveryPassword" RESTART IDENTITY CASCADE; 
        TRUNCATE TABLE "blogs" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "posts" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "comments" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "likesCommentsInfo" RESTART IDENTITY CASCADE;
        TRUNCATE TABLE "likesPostsInfo" RESTART IDENTITY CASCADE;




  `

        await this.dataSource.query(queryuDeleteMany)



    }

}




import { Injectable } from "@nestjs/common";
import { BlogRepository } from "../infrastructure/blogs.repository";
import { BlogCreateModel } from "../models/input/create-blog.input.bodel";
import { blogT } from "../TYPE/type";
import { BlogSqlRepository } from "../infrastructure/blogs.sql.repository";

@Injectable()
export class BlogService {
    constructor( protected blogSqlRepository: BlogSqlRepository) { }

    async creatBlog(blogModel: BlogCreateModel) {
        const newUser: blogT = {
            name: blogModel.name,
            description: blogModel.description,
            websiteUrl: blogModel.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await this.blogSqlRepository.creatInDbBlog(newUser)

    }

    async updateBlog(id: string, inputBlog: BlogCreateModel) {
        await this.blogSqlRepository.updateBlog(id, inputBlog)


    }

    async deletBlog(id: string) {
        await this.blogSqlRepository.deletBlog(id)
    }

}
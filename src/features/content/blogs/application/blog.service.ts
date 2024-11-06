
import { Injectable } from "@nestjs/common";
import { BlogSqlRepository } from "../infrastructure/blogs.sql.repository";
import { BlogCreateModel } from "../models/input/create-blog.input.bodel";
import { blogInputT } from "../type/type";

@Injectable()
export class BlogService {
    constructor(protected blogSqlRepository: BlogSqlRepository) { }

    async creatBlog(blogModel: BlogCreateModel): Promise<string> {
        const newUser: blogInputT = {
            name: blogModel.name,
            description: blogModel.description,
            websiteUrl: blogModel.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await this.blogSqlRepository.creatInDbBlog(newUser)

    }

    async updateBlog(blogId: string, inputBlog: BlogCreateModel): Promise<void> {
        await this.blogSqlRepository.updateBlog(blogId, inputBlog)


    }

    async deletBlog(id: string): Promise<void> {
        await this.blogSqlRepository.deletBlog(id)
    }

}
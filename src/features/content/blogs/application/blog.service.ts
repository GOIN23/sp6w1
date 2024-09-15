
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogRepository } from "../infrastructure/blogs.repository";
import { BlogCreateModel } from "../models/input/create-blog.input.bodel";
import { blogT } from "../TYPE/type";

@Injectable()
export class BlogService {
    constructor(private blogRepository: BlogRepository,) { }

    async creatBlog(blogModel: BlogCreateModel) {
        const newUser: blogT = {
            name: blogModel.name,
            description: blogModel.description,
            websiteUrl: blogModel.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await this.blogRepository.creatInDbBlog(newUser)

    }

    async updateBlog(id: string, inputBlog: BlogCreateModel) {
        await this.blogRepository.updateBlog(id, inputBlog)


    }

    async deletBlog(id: string) {
        await this.blogRepository.deletBlog(id)
    }

}
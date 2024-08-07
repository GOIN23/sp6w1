import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { blogT } from '../TYPE/type';
import { BlogCreateModel } from '../models/input/create-blog.input.bodel';


@Injectable()
export class BlogRepository {
    constructor(@InjectModel(Blog.name) private blogsModel: Model<Blog>) { }


    async creatInDbBlog(newUser: blogT) {
        const result = await this.blogsModel.insertMany(newUser)
        return result[0]._id.toString();
    }

    async findBlogs(id: string) {
        const result = await this.blogsModel.insertMany(id)

        return result

    }

    async updateBlog(id: string, inputBlog: BlogCreateModel) {
        await this.blogsModel.updateOne({ _id: id }, { $set: { name: inputBlog.name, description: inputBlog.description, websiteUrl: inputBlog.websiteUrl } });
    }

    async deletBlog(id: string) {
        await this.blogsModel.deleteOne({ _id: id });

    }
}

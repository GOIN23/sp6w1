import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BlogsEntityT } from '../domain/blog.entityT';
import { BlogCreateModel } from '../models/input/create-blog.input.bodel';
import { blogInputT } from '../type/type';


@Injectable()
export class BlogSqlRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(BlogsEntityT) protected blogs: Repository<BlogsEntityT>) { }


    async creatInDbBlog(newUser: blogInputT): Promise<string> {

        const result = await this.blogs.insert({
            description: newUser.description,
            name: newUser.name,
            isMembership: newUser.isMembership,
            websiteUrl: newUser.websiteUrl,
            createdAt: newUser.createdAt
        });


        return result.identifiers[0].blogId;

    }

    async findBlogs(id: string) {
        const qureBlog = `
        SELECT *
        FROM blogs
        WHERE blog_id = $1
        `
        const parameter = [id]

        try {
            await this.dataSource.query(qureBlog, parameter)

        } catch (error) {
            console.log(error)

        }

    }

    async updateBlog(blogId: string, inputBlog: BlogCreateModel): Promise<void> {
        try {

            await this.blogs
                .createQueryBuilder()
                .update(BlogsEntityT)
                .set({ name: inputBlog.name, description: inputBlog.description, websiteUrl: inputBlog.websiteUrl }) // Устанавливаем isConfirmed в true
                .where('blogId = :blogId', { blogId }) // Фильтруем по userId
                .execute(); // Выполняем запрос



        } catch (error) {
            console.error(error);
        }






    }

    async deletBlog(blogId: string): Promise<void> {

        try {
            await this.blogs.delete({ blogId: +blogId })

        } catch (e) {
            console.log(e)
        }


    }
}

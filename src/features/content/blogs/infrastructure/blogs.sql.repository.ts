import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { blogT } from '../TYPE/type';
import { BlogCreateModel } from '../models/input/create-blog.input.bodel';
import { DataSource } from 'typeorm';


@Injectable()
export class BlogSqlRepository {
    constructor(protected dataSource: DataSource) { }


    async creatInDbBlog(newUser: blogT) {

        const qureBlog = `
        INSERT INTO blogs (name, description, website_url, created_at, is_membership)
        VALUES($1,$2,$3,$4,$5)
        RETURNING blog_id
        `
        const parameter = [newUser.name, newUser.description, newUser.websiteUrl, newUser.createdAt, newUser.isMembership]

        try {
            const blogId = await this.dataSource.query(qureBlog, parameter)
            return blogId[0].blog_id


        } catch (error) {
            console.log(error)

        }
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

    async updateBlog(id: string, inputBlog: BlogCreateModel) {
        const queryuUserTable = `
        UPDATE blogs
        SET name = $1, description = $2, website_url = $3
        WHERE blog_id = $4;
    `;
        const parameter = [inputBlog.name, inputBlog.description, inputBlog.websiteUrl, id]

        try {
            await this.dataSource.query(queryuUserTable, parameter)

        } catch (error) {
            console.log(error)

        }
    }

    async deletBlog(id: string) {

        const queryuPostTable = ` 
        DELETE FROM posts
        WHERE fk_blog = $1
        `

        const queryuSesionTable = ` 
        DELETE FROM blogs
        WHERE blog_id = $1
        `

        const parameter = [id]

        try {
            await this.dataSource.query(queryuPostTable, parameter)
            await this.dataSource.query(queryuSesionTable, parameter)

        } catch (error) {
            console.log(error)
        }


    }
}

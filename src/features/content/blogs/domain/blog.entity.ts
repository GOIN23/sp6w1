import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";







@Schema()
export class Blog {
    @Prop({
        required: true
    })
    name: string;

    @Prop({
        required: true
    })
    description: string;

    @Prop({
        required: true
    })
    websiteUrl: string;

    @Prop({
        required: true
    })
    createdAt: string
    @Prop({
        required: true
    })
    isMembership: boolean

    static creatBlog(name: string, description: string, websiteUrl: string, createdAt: string, isMembership: boolean) {
        const blog: Blog = new this()

        blog.name = name
        blog.createdAt = createdAt
        blog.description = description
        blog.isMembership = isMembership
        blog.websiteUrl = websiteUrl

        return blog

    }

    setAge(age: string) {
        console.log(age)

    }

}
export type BlogDocument = HydratedDocument<Blog>;


export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
    setAge: Blog.prototype.setAge
} // Таким образом добавляем обычные методы

BlogSchema.loadClass(Blog) // Если мы не используем этот метод, то статичная функция не заработает
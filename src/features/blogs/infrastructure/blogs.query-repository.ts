import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog } from "../domain/blog.entity";
import { Model } from "mongoose";
import { blogOutputModelMapper } from "../models/output/blog.output.model";
import { QueryBlogsParamsDto } from "../dto/dto.query.body";
import { BlogViewModelDbT, BlogViewModelT } from "../TYPE/typeBlog";
import { SortDirection } from "mongodb";
import { PostViewModelLiKeArrayDB, PostViewModelT } from "../../posts/type/typePosts"
import { Posts } from "../../posts/domain/posts.entity";
import { PostsQueryRepository } from "src/features/posts/infrastructure/posts.query-repository";
// import { PostViewModelLiKeArrayDB, PostViewModelT, PostViewModelTdb } from "src/posts/type/typePosts";
// import { Posts } from "src/posts/domain/posts.entity";

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>, @InjectModel(Posts.name) private postModel: Model<Posts>, private postsQueryRepository: PostsQueryRepository) {
    }

    async getById(blogId: string) {
        try {

            const blog = await this.blogModel.findOne({ _id: blogId })
            return blogOutputModelMapper(blog);
        } catch (error) {
            console.log(error)
        }
    }

    async getBlogs(query: QueryBlogsParamsDto): Promise<any | { error: string }> {
        debugger
        const search = query.searchNameTerm ? { name: { $regex: query.searchNameTerm, $options: "i" } } : {};
        const filter = {
            ...search,
        };
        try {
            const items: BlogViewModelDbT[] = await this.blogModel
                .find(filter)
                .sort({ [query.sortBy]: query.sortDirection as SortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize).lean();

            const totalCount = await this.blogModel.countDocuments(filter);

            const mapBlogs: BlogViewModelT[] = items.map((blog: BlogViewModelDbT) => {
                return {
                    id: blog._id,
                    createdAt: blog.createdAt,
                    description: blog.description,
                    isMembership: blog.isMembership,
                    name: blog.name,
                    websiteUrl: blog.websiteUrl,
                };
            });
            return {
                pagesCount: +Math.ceil(totalCount / query.pageSize),
                page: +query.pageNumber,
                pageSize: +query.pageSize,
                totalCount: +totalCount,
                items: mapBlogs,
            };
        } catch (e) {
            return { error: "some error" };
        }
    }


    async getBlogsPosts(query: any, id: string, userId?: string): Promise<any | { error: string }> {
        debugger
        const search = query.searchNameTerm ? { name: { $regex: query.searchNameTerm, $options: "i" } } : {};
        const blogId = id;
        const filter = {
            blogId,
            ...search,
        };
        try {
            const items: PostViewModelLiKeArrayDB[] = await this.postModel
                .find(filter)
                .sort({ [query.sortBy]: query.sortDirection as SortDirection })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize).lean();

            const totalCount = await this.postModel.countDocuments(filter);

            const mapPosts: any = await this.postsQueryRepository.mapPosts(items, userId)
            return {
                pagesCount: +Math.ceil(totalCount / query.pageSize),
                page: +query.pageNumber,
                pageSize: +query.pageSize,
                totalCount: +totalCount,
                items: mapPosts,
            };
        } catch (e) {
            console.log(e);
            return { error: "some error" };
        }
    }


}

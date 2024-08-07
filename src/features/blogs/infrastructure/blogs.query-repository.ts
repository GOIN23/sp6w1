import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog } from "../domain/blog.entity";
import { Model } from "mongoose";
import { blogOutputModelMapper } from "../models/output/blog.output.model";
import { QueryBlogsParamsDto } from "../dto/dto.query.body";
import { BlogViewModelDbT, BlogViewModelT } from "../TYPE/typeBlog";
import { SortDirection } from "mongodb";
import { BlogCreateModel } from "../models/input/create-blog.input.bodel";
import { Posts } from "src/features/posts/domain/posts.entity";
import { PostViewModelLiKeArrayDB, PostViewModelT } from "src/features/posts/type/typePosts";
// import { PostViewModelLiKeArrayDB, PostViewModelT, PostViewModelTdb } from "src/posts/type/typePosts";
// import { Posts } from "src/posts/domain/posts.entity";

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>, @InjectModel(Posts.name) private postModel: Model<Posts>) {
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


    async getBlogsPosts(query: any, id: string): Promise<any | { error: string }> {
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

            const mapPosts: PostViewModelT[] = items.map((post: PostViewModelLiKeArrayDB) => {
                return {
                    id: post._id,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    content: post.content,
                    createdAt: post.createdAt,
                    shortDescription: post.shortDescription,
                    title: post.title,
                    extendedLikesInfo: {
                        dislikesCount: post.extendedLikesInfo.dislikesCount,
                        likesCount: post.extendedLikesInfo.likesCount,
                        myStatus: post.extendedLikesInfo.myStatus,
                        newestLikes: post.extendedLikesInfo.newestLikes
                    }
                };
            });
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

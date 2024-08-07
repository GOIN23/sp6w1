import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { postOutputModelMapper, postsOutputModel } from "../models/output/posts.output.model";
import { SortDirection } from "mongodb";
import { Posts } from "../domain/posts.entity";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { PostViewModelLiKeArrayDB, PostViewModelT, PostViewModelTdb } from "../type/typePosts";

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectModel(Posts.name) private postModel: Model<Posts>) {
    }

    public async getById(postId: string) {
        try {
            const post = await this.postModel.findOne({ _id: postId })
            return postOutputModelMapper(post);
        } catch (error) {
            console.log(error)
        }
    }


    async getPosts(query: QueryPostsParamsDto): Promise<any | { error: string }> {
        const search = query.searchNameTerm ? { title: { $regex: query.searchNameTerm, $options: "i" } } : {};
        const filter = {
            ...search,
        };
        try {
            const items: PostViewModelLiKeArrayDB[] = await this.postModel
                .find({})
                .sort({ [query.sortBy]: query.sortDirection as SortDirection })
                .skip((+query.pageNumber - 1) * +query.pageSize)
                .limit(+query.pageSize).lean();

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

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SortDirection } from "mongodb";
import { Posts } from "../domain/posts.entity";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { PostViewModelLiKeArray, PostViewModelLiKeArrayDB, PostViewModelT, PostViewModelTdb, statusCommentLike } from "../type/typePosts";
import { LikesPostInfo } from "../domain/likes-posts.entity";

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectModel(Posts.name) private postModel: Model<Posts>, @InjectModel(LikesPostInfo.name) private likesPostModule: Model<LikesPostInfo>) {
    }

    public async getById(postId: string, userId?: string) {
        const result = await this.postModel.findOne({ _id: postId });
        if (!result) {
            return null;
        }

        //@ts-ignore
        const commentMap = await this.mapPost(result, userId);
        return commentMap


    }


    async getPosts(query: QueryPostsParamsDto, userId?: string): Promise<any | { error: string }> {
    
        const search = query.searchNameTerm ? { title: { $regex: query.searchNameTerm, $options: "i" } } : {};
        const filter = {
            ...search,
        };
        try {
            debugger
            const items: PostViewModelLiKeArrayDB[] = await this.postModel
                .find({})
                .sort({ [query.sortBy]: query.sortDirection as SortDirection })
                .skip((+query.pageNumber - 1) * +query.pageSize)
                .limit(+query.pageSize).lean();

            const totalCount = await this.postModel.countDocuments(filter);


            const posts = await this.mapPosts(items, userId);



            return {
                pagesCount: +Math.ceil(totalCount / query.pageSize),
                page: +query.pageNumber,
                pageSize: +query.pageSize,
                totalCount: +totalCount,
                items: posts,
            };
        } catch (e) {
            console.log(e);
            return { error: "some error" };
        }




    }


    public async mapPost(post: PostViewModelTdb, userId?: string): Promise<PostViewModelLiKeArray> {


        const dislikesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Dislike" });
        const likesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Like" });
        const userLikeStatus = await this.likesPostModule.findOne({ postId: post._id, userID: userId })

        const newestLikes = await this.likesPostModule.find({ postId: post._id, status: "Like" }).lean()


        let countingUserLikes: any
        if (newestLikes.length === 1) {
            countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }]

        } else if (newestLikes.length === 2) {
            countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }]

        } else if (newestLikes.length === 3) {
            countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

        } else if (newestLikes.length > 3) {
            countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

        } else if (newestLikes.length === 0) {
            countingUserLikes = []
        }

        let resultStatus
        if (!userLikeStatus) {
            resultStatus = statusCommentLike.None
        } else {
            resultStatus = userLikeStatus!.status
        }




        return {
            id: post._id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: likesCount,
                dislikesCount: dislikesCount,
                myStatus: resultStatus,
                newestLikes: countingUserLikes
            }


        };
    }


    public async mapPosts(items: PostViewModelTdb[], userId?: string): Promise<PostViewModelLiKeArray[]> {
        const promises = items.map(async (post: PostViewModelTdb) => {
            const dislikesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Dislike" });
            const likesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Like" });
            const userLikeStatus = await this.likesPostModule.findOne({ postId: post._id, userID: userId })

            const newestLikes = await this.likesPostModule.find({ postId: post._id, status: "Like" }).lean()


            let countingUserLikes: any
            if (newestLikes.length === 1) {
                countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }]

            } else if (newestLikes.length === 2) {
                countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }]

            } else if (newestLikes.length === 3) {
                countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

            } else if (newestLikes.length > 3) {
                countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

            } else if (newestLikes.length === 0) {
                countingUserLikes = []
            }

            let resultStatus
            if (!userLikeStatus) {
                resultStatus = statusCommentLike.None
            } else {
                resultStatus = userLikeStatus!.status
            }


            return {
                id: post._id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount,
                    myStatus: resultStatus,
                    newestLikes: countingUserLikes
                }


            };
        })


        const userMapData = await Promise.all(promises)

        return userMapData;
    }


}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { postOutputModelMapper, postsOutputModel } from "../models/output/posts.output.model";
import { SortDirection } from "mongodb";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { Comments } from "../domain/comments.entity";
import { LikesCommentsInfo } from "../domain/likes.entity";
import { CommentViewModel, CommentViewModelDb, statusCommentLike } from "../type/typeCommen";
import { Paginator } from "src/utilit/TYPE/generalType";

@Injectable()
export class CommentsQueryRepository {
    constructor(@InjectModel(Comments.name) protected commentsModel: Model<Comments>, @InjectModel(LikesCommentsInfo.name) protected likesModule: Model<LikesCommentsInfo>) {
    }

    async getCommentById(id: string, userId: string) {
        const result = await this.commentsModel.findOne({ _id: id });
        if (!result) {
            return null;
        }
        let status;
        if (userId === "null") {
            status = statusCommentLike.None;
        } else {
            const findUserStatusLike = await this.likesModule.findOne({ userID: userId, commentId: id });
            status = findUserStatusLike?.status || statusCommentLike.None;
        }

        const dislikesCount = await this.likesModule.countDocuments({ commentId: id, status: statusCommentLike.Dislike });
        const likesCount = await this.likesModule.countDocuments({ commentId: id, status: statusCommentLike.Like });

        const mapData: CommentViewModel = {
            id: result._id.toString(),
            commentatorInfo: {
                userId: result.commentatorInfo.userId,
                userLogin: result.commentatorInfo.userLogin,
            },
            content: result.content,
            createdAt: result.createdAt,
            likesInfo: {
                dislikesCount: dislikesCount,
                likesCount: likesCount,
                myStatus: status,
            },
        };

        return mapData;
    }

    async getCommentPosts(IdPost: string, query: any, userId?: string): Promise<Paginator<CommentViewModel> | { error: string }> {
        const filter = { IdPost };

        try {
            const items: CommentViewModelDb[] = await this.commentsModel
                .find(filter)
                .sort({ [query.sortBy]: query.sortDirection === "asc" ? 1 : -1 })
                .skip((query.pageNumber - 1) * query.pageSize)
                .limit(query.pageSize).lean();

            const totalCount = await this.commentsModel.countDocuments(filter);


            const commentMap = await this.mapComments(items, userId);

            return {
                pagesCount: Math.ceil(totalCount / query.pageSize),
                page: query.pageNumber,
                pageSize: query.pageSize,
                totalCount,
                items: commentMap,
            };
        } catch (e) {
            return { error: e };
        }
    }

    private async mapComments(items: CommentViewModelDb[], userId?: string): Promise<CommentViewModel[]> {
        const promises = items.map(async (comment: CommentViewModelDb) => {


            const dislikesCount = await this.likesModule.countDocuments({ commentId: comment._id, status: "Dislike" });
            const likesCount = await this.likesModule.countDocuments({ commentId: comment._id, status: "Like" });
            const userLikeStatus = await this.likesModule.findOne({ commentId: comment._id, userID: userId })
            let resultStatus
            if (!userLikeStatus) {
                resultStatus = statusCommentLike.None
            } else {
                resultStatus = userLikeStatus!.status
            }


            return {
                id: comment._id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin,
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    dislikesCount,
                    likesCount,
                    myStatus: resultStatus,
                },
            };
        })


        const userMapData = await Promise.all(promises)

        return userMapData;


    }


}

import { Injectable } from '@nestjs/common';

import { PostsCreateModel } from "../models/input/create-posts.input.bodel";
import { statusCommentLike } from "../type/typePosts";
import { PostRepository } from "../infrastructure/posts.repository";
import { BlogOutputModel } from "../../blogs/models/output/blog.output.model"
import { CommentLikeT, CommentViewModel, CommentViewModelDb } from "../../comments/type/typeCommen"
import { ObjectId } from "mongodb"


@Injectable()
export class PostsService {
    constructor(private postRepository: PostRepository) { }

    async creatPosts(postsModel: PostsCreateModel, blog: BlogOutputModel) {

        const newUser: any = {
            blogId: postsModel.blogId,
            blogName: blog.name,
            content: postsModel.content,
            createdAt: new Date().toISOString(),
            shortDescription: postsModel.shortDescription,
            title: postsModel.title,
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: statusCommentLike.None,
                newestLikes: []
            }


        }
        return await this.postRepository.creatInDbPost(newUser)

    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        await this.postRepository.updatePost(id, postsModel)
    }

    async deletePost(id: string) {
        await this.postRepository.deletePost(id)
    }

    async createCommentPost(content: string, user: any, IdPost: string): Promise<CommentViewModel | null> {

        const newCommentPosts: CommentViewModelDb = {
            _id: new ObjectId().toString(),
            content: content,
            commentatorInfo: {
                userId: user._id,
                userLogin: user.login,
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: statusCommentLike.None,
            },
            IdPost,
        };

        type CommentWithouId = Omit<CommentLikeT, '_id'>;


        const likeInfoMetaData: CommentWithouId = {
            commentId: newCommentPosts._id,
            createdAt: new Date().toISOString(),
            status: statusCommentLike.None,
            userID: user._id,
        };

        await this.postRepository.createCommentPost(newCommentPosts);
        await this.postRepository.createLikeInfoMetaDataComment(likeInfoMetaData);


        return {
            id: newCommentPosts._id,
            commentatorInfo: newCommentPosts.commentatorInfo,
            content: newCommentPosts.content,
            createdAt: newCommentPosts.createdAt,
            likesInfo: newCommentPosts.likesInfo,
        };
    }

    async updatePostsLikeDeslike(likeStatus: statusCommentLike, postId: string, userId: string, userLogin: string) {
        const fintLikeDislake = await this.postRepository.findLikeDislakePost(userId, postId);
        if (!fintLikeDislake) {
            const likeInfoMetaData: any = {
                postId: postId,
                createdAt: new Date().toISOString(),
                status: likeStatus,
                userID: userId,
                login: userLogin
            };

            await this.postRepository.addLikeDislikeInPosts(likeInfoMetaData);
            return;
        }

        await this.postRepository.updateLikeStatusInPosts(userId, likeStatus, postId);
    }


}
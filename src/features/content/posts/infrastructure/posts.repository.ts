import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments } from '../../comments/domain/comments.entity';
import { LikesCommentsInfo } from '../../comments/domain/likes.entity';
import { CommentViewModelDb, PostLikeT } from '../../comments/type/typeCommen';
import { LikesPostInfo } from '../domain/likes-posts.entity';
import { Posts } from '../domain/posts.entity';
import { PostsCreateModel } from '../models/input/create-posts.input.bodel';
import { PostViewModelLiKeArray } from '../type/typePosts';


@Injectable()
export class PostRepository {
    constructor(@InjectModel(Posts.name) private postModel: Model<Posts>, @InjectModel(Comments.name) private commentsModel: Model<Comments>, @InjectModel(LikesCommentsInfo.name) private likesModule: Model<LikesCommentsInfo>, @InjectModel(LikesPostInfo.name) private likesPostModule: Model<LikesPostInfo>) { }


    async creatInDbPost(newUser: PostViewModelLiKeArray) {
        const result = await this.postModel.insertMany(newUser)
        return result[0]._id.toString();
    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        await this.postModel.updateOne(
            { _id: id },
            { $set: { content: postsModel.content, blogId: postsModel.blogId, shortDescription: postsModel.shortDescription, title: postsModel.title } }
        );
    }

    async deletePost(id: string) {
        await this.postModel.deleteOne({ _id: id });

    }
    async createCommentPost(body: CommentViewModelDb): Promise<void> {
        await this.commentsModel.insertMany(body);
    }

    async createLikeInfoMetaDataComment(body: any): Promise<void> {
        await this.likesModule.insertMany(body);
    }

    async findLikeDislakePost(userID: string, postId: string): Promise<PostLikeT | boolean> {
        try {
            const res = await this.likesPostModule.findOne({ userID: userID, postId: postId });
            if (!res) {
                return false;
            }
            return true;
        } catch {
            return false

        }

    }
    async addLikeDislikeInPosts(likesPostInfo: any) {
        await this.likesPostModule.insertMany(likesPostInfo);
    }
    async updateLikeStatusInPosts(userId: string, likeStatus: string, postId: string) {
        await this.likesPostModule.updateOne({ userID: userId, postId: postId }, { $set: { status: likeStatus } });
    }
}

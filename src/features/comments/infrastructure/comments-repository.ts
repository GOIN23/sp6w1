import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments } from '../domain/comments.entity';
import { UpdateCommentCommand } from '../application/use-case/update-use-case';
import { LikesCommentsInfo } from '../domain/likes.entity';


@Injectable()
export class CommentsRepository {
    constructor(@InjectModel(Comments.name) private commentsModel: Model<Comments>, @InjectModel(LikesCommentsInfo.name) private likesModule: Model<LikesCommentsInfo>) { }



    async updateComment(dtoInputDate: UpdateCommentCommand) {
        await this.commentsModel.updateOne({ _id: dtoInputDate.id }, { $set: { content: dtoInputDate.content } });


    }

    async deleteCommetn(id: string) {
        await this.commentsModel.deleteOne({ _id: id })

    }


    async findLikeDislakeComment(userID: string, commentId: string) {
        try {
            const res = await this.likesModule.findOne({ userID: userID, commentId: commentId });
            if (!res) {
                return false;
            }

            return true

        } catch (error) {

            return null
        }


    }

    async creatLikesDislek(body: any) {
        await this.likesModule.insertMany(body);
    }
    async updateLikeStatusInComment(userId: string, likeStatus: string, commentId: string) {
        await this.likesModule.updateOne({ userID: userId, commentId: commentId }, { $set: { status: likeStatus } });
    }

}

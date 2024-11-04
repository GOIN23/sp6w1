import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateCommentCommand } from '../application/use-case/update-use-case';
import { CommentsEntityT } from '../domain/comments.entityT';
import { LikesInfoCommentsEntityT } from '../domain/likes.comments.entityT';


@Injectable()
export class CommentsSqlRepository {
    constructor(protected dataSource: DataSource,
        @InjectRepository(CommentsEntityT)
        protected comments: Repository<CommentsEntityT>,
        @InjectRepository(LikesInfoCommentsEntityT)
        protected likesInfoComments: Repository<LikesInfoCommentsEntityT>

    ) { }

    async updateComment(dtoInputDate: UpdateCommentCommand) {

        try {
            const result = await this.comments
                .createQueryBuilder()
                .update(CommentsEntityT)
                .set({
                    content: dtoInputDate.content
                }) // Устанавливаем isConfirmed в true
                .where('commentsId = :commentsId', { commentsId: dtoInputDate.id }) // Фильтруем по userId
                .execute(); // Выполняем запрос


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error confirming email:', error);
            return false; // Возвращаем false в случае ошибки
        }

    }
    async deleteCommetn(id: string) {

        try {
            await this.comments.delete({ commentsId: +id })

        } catch (error) {
            console.log(error)
        }
    }
    async findLikeDislakeComment(userID: string, commentId: string) {

        try {
            const likesInfoComments = await this.likesInfoComments
                .createQueryBuilder('l')
                .where('l.commentsId = :commentId', { commentId })
                .andWhere('l.userFkId = :userID', { userID })
                .getOne()

            return likesInfoComments
        } catch (error) {

            console.log(error)
        }

    }
    async creatLikesDislek(body: any) {
        try {
            await this.likesInfoComments.insert({
                users: body.userID,
                comments: body.commentId,
                createdAt: body.createdAt,
                status: body.status
            })

        } catch (error) {
            console.log(error)
        }
    }
    async updateLikeStatusInComment(userId: string, likeStatus: string, commentId: string) {

        try {
            const result = await this.comments
                .createQueryBuilder()
                .update(LikesInfoCommentsEntityT)
                .set({
                    status: likeStatus
                }) // Устанавливаем isConfirmed в true
                .where('commentsId = :commentId', { commentId })
                .andWhere('userFkId = :userId', { userId }) // Фильтруем по userId
                .execute(); // Выполняем запрос


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error confirming email:', error);
            return false; // Возвращаем false в случае ошибки
        }



    }
}

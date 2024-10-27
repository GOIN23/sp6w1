import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateCommentCommand } from '../application/use-case/update-use-case';


@Injectable()
export class CommentsSqlRepository {
    constructor(protected dataSource: DataSource) { }

    async updateComment(dtoInputDate: UpdateCommentCommand) {


        const queryuPostTable = `
        UPDATE comments
        SET content = $1
        WHERE comments_id = $2;
    `;
        const parameter = [dtoInputDate.content, dtoInputDate.id]

        try {
            await this.dataSource.query(queryuPostTable, parameter)

        } catch (error) {
            console.log(error)

        }

    }

    async deleteCommetn(id: string) {

        const qureLikesInfoComments = `
         DELETE FROM likes_info_comments
         WHERE comments_fk_id = $1
        `

        const parameterLikesInfo = [id]

        try {
            await this.dataSource.query(qureLikesInfoComments, parameterLikesInfo)
        } catch (error) {
            console.log(error)
        }

        const queryCommentsTable = ` 
        DELETE FROM comments
        WHERE comments_id = $1
        `

        const parameterComment = [id]

        try {
            await this.dataSource.query(queryCommentsTable, parameterComment)
        } catch (error) {
            console.log(error)
        }



    }

    async findLikeDislakeComment(userID: string, commentId: string) {


        const qureComment = `SELECT *
        FROM likes_info_comments
        WHERE user_fk_id = $1 AND comments_fk_id = $2
                `
        const parametrComment = [userID, commentId]

        try {
            const result = await this.dataSource.query(qureComment, parametrComment)

            return result[0]
        } catch (error) {
            console.log(error)

        }


    }

    async creatLikesDislek(body: any) {
        const queryCommentsTable = ` 
        INSERT INTO likes_info_comments (user_fk_id, comments_fk_id, created_at_info, status, user_login)
        VALUES($1, $2, $3, $4, $5)
        `

        const parameter = [body.userID, body.commentId, body.createdAt, body.status, body.userLogin]


        try {
            const commentsId = await this.dataSource.query(queryCommentsTable, parameter)

            return commentsId[0].comments_id
        } catch (error) {
            console.log(error)
        }
    }
    async updateLikeStatusInComment(userId: string, likeStatus: string, commentId: string) {
        const queryuPostTable = `
        UPDATE likes_info_comments
        SET status = $1
        WHERE user_fk_id = $2 AND comments_fk_id = $3;
    `;
        const parameter = [likeStatus, userId, commentId]

        try {
            await this.dataSource.query(queryuPostTable, parameter)

        } catch (error) {
            console.log(error)

        }
    }
}

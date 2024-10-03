import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Paginator } from "../../../../utilit/TYPE/generalType";
import { CommentViewModel, CommentViewModelDb, statusCommentLike } from "../type/typeCommen";

@Injectable()
export class CommentsQuerySqlRepository {
    constructor(protected dataSource: DataSource) {
    }

    // async getCommentById(id: string, userId: string) {
    //     const result = await this.commentsModel.findOne({ _id: id });
    //     if (!result) {
    //         return null;
    //     }
    //     let status;
    //     if (userId === "null") {
    //         status = statusCommentLike.None;
    //     } else {
    //         const findUserStatusLike = await this.likesModule.findOne({ userID: userId, commentId: id });
    //         status = findUserStatusLike?.status || statusCommentLike.None;
    //     }

    //     const dislikesCount = await this.likesModule.countDocuments({ commentId: id, status: statusCommentLike.Dislike });
    //     const likesCount = await this.likesModule.countDocuments({ commentId: id, status: statusCommentLike.Like });

    //     const mapData: CommentViewModel = {
    //         id: result._id.toString(),
    //         commentatorInfo: {
    //             userId: result.commentatorInfo.userId,
    //             userLogin: result.commentatorInfo.userLogin,
    //         },
    //         content: result.content,
    //         createdAt: result.createdAt,
    //         likesInfo: {
    //             dislikesCount: dislikesCount,
    //             likesCount: likesCount,
    //             myStatus: status,
    //         },
    //     };

    //     return mapData;
    // }

    async getCommentPosts(IdPost: string, query: any, userId?: string): Promise<Paginator<CommentViewModel> | { error: string }> {
        debugger

        const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'

        const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

        const queryuUserTable = `
        SELECT *
        FROM comments
        WHERE (LOWER(created_at) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        AND post_id_fk = $2
        ORDER BY ${sortBy} COLLATE "C" ${sortDirection} 
        LIMIT $3 OFFSET $4;
    `;

        const parametr = [query.searchNameTerm || '', IdPost, query.pageSize, (query.pageNumber - 1) * query.pageSize];

        const items = await this.dataSource.query(queryuUserTable, parametr)

        const commentMap = await this.mapComments(items, userId);

        const countComments = `
        SELECT COUNT(*)
        FROM comments
        WHERE (LOWER(created_at) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        AND post_id_fk = $2
    `;
        const parametrCommentCount = [query.searchNameTerm || '', IdPost]
        const totalItemsResult = await this.dataSource.query(countComments, parametrCommentCount);
        const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее 



        return {
            pagesCount: Math.ceil(totalCount / query.pageSize),
            page: query.pageNumber,
            pageSize: query.pageSize,
            totalCount,
            items: commentMap,
        };

    }

    private async mapComments(items: CommentViewModelDb[], userId?: string): Promise<any[]> {
        const promises = items.map(async (comment: CommentViewModelDb) => {


            const countDislike = `
            SELECT COUNT(*)
            FROM likes_info_comments
            WHERE LOWER(status) = 'dislike';

          `;

            const resultCountDislike = await this.dataSource.query(countDislike)

            const countLike = `
             SELECT COUNT(*)
             FROM likes_info_comments
             WHERE LOWER(status)  = 'likes'
        `;

            const resultCountLike = await this.dataSource.query(countLike)


            const resComment = `
            SELECT user_fk_id, comments_fk_id, user_login
            FROM comments
            LEFT JOIN likes_info_comments ON likes_info_comments.comments_fk_id = comments.comments_id
       `;


            const findComment = await this.dataSource.query(resComment)

            const userStatus = `
             SELECT *
             FROM likes_info_comments
             WHERE user_fk_id = $1 AND comments_fk_id = $2
          `;

            //@ts-ignore
            const parametr = [userId === 'null' ? null : userId, comment.comments_id]

            const resultUserStatus = await this.dataSource.query(userStatus, parametr)


            let resultStatus
            if (!resultUserStatus[0]) {
                resultStatus = statusCommentLike.None
            } else {
                resultStatus = resultUserStatus[0]!.status
            }


            return {
                //@ts-ignore
                id: comment.comments_id,
                content: comment.content,
                commentatorInfo: {
                    userId: findComment[0].user_fk_id,
                    userLogin: findComment[0].user_login,
                },
                //@ts-ignore
                createdAt: comment.created_at,
                likesInfo: {
                    dislikesCount: resultCountDislike[0].count,
                    likesCount: resultCountLike[0].count,
                    myStatus: resultStatus,
                },
            };
        })


        const userMapData = await Promise.all(promises)

        return userMapData;


    }


}

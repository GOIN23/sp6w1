import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginatorT, ResultObject } from "../../../../utilit/TYPE/generalType";
import { CommentsEntityT } from "../domain/comments.entityT";
import { LikesInfoCommentsEntityT } from "../domain/likes.comments.entityT";
import { CommentViewModel, statusCommentLike } from "../type/typeCommen";

@Injectable()
export class CommentsQuerySqlRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(CommentsEntityT)
    protected comments: Repository<CommentsEntityT>, @InjectRepository(LikesInfoCommentsEntityT)
        protected likesInfoComments: Repository<LikesInfoCommentsEntityT>
    ) {
    }

    async getCommentById(commentsId: string, userId: string) {

        const comments = await this.likesInfoComments
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.comments', 'c')
            .leftJoinAndSelect('l.users', 'u')
            .where('c.commentsId = :commentsId', { commentsId, })
            .getMany()


        if (!comments[0]) {
            return null;
        }



        let status: statusCommentLike = statusCommentLike.None

        if (userId === null) {
            status = statusCommentLike.None;
        } else {
            const qureLikesInfoComments = await this.likesInfoComments
                .createQueryBuilder('l')
                .where('l.commentsId = :commentsId', { commentsId })
                .andWhere('l.userFkId = :userId', { userId })
                .getMany()

            try {
                status = (qureLikesInfoComments[0].status as statusCommentLike) || statusCommentLike.None

            } catch (error) {

                console.log(error)
            }
        }



        const qureCountLikeDislike = await this.likesInfoComments
            .createQueryBuilder('l')
            .select('COUNT(*)', 'countDislike')
            .addSelect(
                (subQuery) => {
                    return subQuery.select("COUNT(*)")
                        .from(LikesInfoCommentsEntityT, "likes")
                        .where("likes.status = 'Like'")
                        .andWhere("likes.commentsId = :commentsId", { commentsId })
                },
                'countLike'
            )
            .where("l.status = 'Dislike'")
            .andWhere("l.commentsId = :commentsId", { commentsId })
            .getRawOne();




        const mapData: CommentViewModel = {
            id: comments[0].comments.commentsId.toString(),
            commentatorInfo: {
                userId: comments[0].users.userId.toString(),
                userLogin: comments[0].users.login

            },
            content: comments[0].comments.content,
            createdAt: comments[0].comments.createdAt,
            likesInfo: {
                dislikesCount: +qureCountLikeDislike.countDislike,
                likesCount: +qureCountLikeDislike.countLike,
                myStatus: status || statusCommentLike.None,
            },
        };

        return mapData;
    }

    async complianceCheckUserComment(commentId: string, userId: string): Promise<ResultObject<CommentsEntityT>> {
        try {
            const result = await this.comments.findOne({
                where: { commentsId: +commentId },
                relations: ['users']
            })


            if (result.users.userId !== +userId) {
                return {
                    result: false,
                    errorMessage: "Forbidden",
                    data: null
                }
            }



            return {
                result: true,
                errorMessage: "fulfilled",
                data: result
            }

        } catch (e) {
            return {
                result: false,
                errorMessage: "not found",
                data: null
            }
        }
    }

    async findComment(commentId: string) {
        try {
            const result = await this.likesInfoComments
                .createQueryBuilder('l')
                .leftJoinAndSelect('l.comments', 'c')
                .leftJoinAndSelect('c.users', 'u')
                .where('c.commentsId = :commentId', { commentId })
                .getOne()

            return result
        } catch (error) {
            console.log(error)

        }


    }

    async getCommentPosts(IdPost: string, query: any, userId?: string): Promise<PaginatorT<CommentViewModel> | { error: string }> {

        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchTitleTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;

        const [result, totalCount] = await this.comments
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.users', 'u')
            .where(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                searchTitleTerm
            })
            .andWhere('c.postFkId = :IdPost', { IdPost })
            .orderBy(`c.${query.sortBy} COLLATE "C"`, sortDirection)
            .limit(query.pageSize)
            .offset((query.pageNumber - 1) * query.pageSize)
            .getManyAndCount();





        const commentMap = await this.mapComments(result, userId);

        //     const countComments = `
        //     SELECT COUNT(*)
        //     FROM comments
        //     WHERE (LOWER(created_at) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        //     AND post_id_fk = $2
        // `;
        //     const parametrCommentCount = [query.searchNameTerm || '', IdPost]
        //     const totalItemsResult = await this.dataSource.query(countComments, parametrCommentCount);
        //     // const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее 



        return {
            pagesCount: +Math.ceil(totalCount / query.pageSize),
            page: +query.pageNumber,
            pageSize: +query.pageSize,
            totalCount,
            items: commentMap,
        };

    }

    private async mapComments(items: any[], userId?: string): Promise<any[]> {
        const promises = items.map(async (comment: CommentsEntityT) => {

            let status: statusCommentLike = statusCommentLike.None

            if (userId === null) {
                status = statusCommentLike.None;
            } else {
                const qureLikesInfoComments = await this.likesInfoComments
                    .createQueryBuilder('l')
                    .where('l.commentsId = :commentsId', { commentsId: comment.commentsId })
                    .andWhere('l.userFkId = :userId', { userId })
                    .getMany()

                try {
                    status = (qureLikesInfoComments[0].status as statusCommentLike) || statusCommentLike.None

                } catch (error) {
                    console.log(error)
                }
            }



            const qureCountLikeDislike = await this.likesInfoComments
                .createQueryBuilder('l')
                .select('COUNT(*)', 'countDislike')
                .addSelect(
                    (subQuery) => {
                        return subQuery.select("COUNT(*)")
                            .from(LikesInfoCommentsEntityT, "likes")
                            .where("likes.status = 'Like'")
                            .andWhere("likes.commentsId = :commentsId", { commentsId: comment.commentsId })
                    },
                    'countLike'
                )
                .where("l.status = 'Dislike'")
                .andWhere("l.commentsId = :commentsId", { commentsId: comment.commentsId })
                .getRawOne();




            const mapData: CommentViewModel = {
                id: comment.commentsId.toString(),
                commentatorInfo: {
                    userId: comment.users.userId.toString(),
                    userLogin: comment.users.login

                },
                content: comment.content,
                createdAt: comment.createdAt,
                likesInfo: {
                    dislikesCount: +qureCountLikeDislike.countDislike,
                    likesCount: +qureCountLikeDislike.countLike,
                    myStatus: status,
                },
            };

            return mapData;



            //         const qureCount = `
            //         SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_comments WHERE likes_info_comments.status = 'Like' AND comments_fk_id = $1)
            //         FROM likes_info_comments c
            //         WHERE c.status = 'Dislike' AND comments_fk_id = $1
            //         `
            //         const parametrCount = [comment.comments_id]

            //         const countLikes = await this.dataSource.query(qureCount, parametrCount)

            //         const resComment = `
            //         SELECT likes_info_comments.user_fk_id, comments_fk_id, user_login
            //         FROM comments
            //         LEFT JOIN likes_info_comments ON likes_info_comments.comments_fk_id = comments.comments_id
            //    `;


            //         const findComment = await this.dataSource.query(resComment)

            //         const userStatus = `
            //          SELECT *
            //          FROM likes_info_comments
            //          WHERE user_fk_id = $1 AND comments_fk_id = $2
            //       `;

            //         const parametr = [userId === null ? null : userId, comment.comments_id]

            //         const resultUserStatus = await this.dataSource.query(userStatus, parametr)


            //         let resultStatus
            //         if (!resultUserStatus[0]) {
            //             resultStatus = statusCommentLike.None
            //         } else {
            //             resultStatus = resultUserStatus[0]!.status
            //         }


            //         return {
            //             id: comment.comments_id.toString(),
            //             content: comment.content,
            //             commentatorInfo: {
            //                 userId: findComment[0].user_fk_id.toString(),
            //                 userLogin: findComment[0].user_login,
            //             },
            //             createdAt: comment.created_at,
            //             likesInfo: {
            //                 likesCount: +countLikes[0].count_like,
            //                 dislikesCount: +countLikes[0].count_dislike,
            //                 myStatus: resultStatus,
            //             },
            //         };
        })


        const userMapData = await Promise.all(promises)

        return userMapData;


    }


}





















// @Injectable()
// export class CommentsQuerySqlRepository {
//     constructor(protected dataSource: DataSource) {
//     }

//     async getCommentById(id: string, userId: string) {
//         const qureComment = `SELECT c.comments_id,
//     c.content,
//     c.created_at,
//     c.post_id_fk,
//     l.user_fk_id,
//     l.user_login
//         FROM comments c
//         LEFT JOIN likes_info_comments l ON c.comments_id = l.comments_fk_id
//         WHERE c.comments_id = $1 ${userId === null ? '' : 'AND l.user_fk_id = $2'};
//         `
//         const parametrComment = [id]

//         userId === null ? '' : parametrComment.push(userId)

//         let result
//         try {
//             result = await this.dataSource.query(qureComment, parametrComment)


//             if (!result[0]) {
//                 return null;
//             }
//         } catch (error) {

//             console.log(error)
//         }

//         let status;
//         let commentatorInfo
//         if (userId === null) {
//             status = statusCommentLike.None;
//         } else {
//             const qureLikesInfoComments = `SELECT *
//                    FROM likes_info_comments
//                    WHERE comments_fk_id = $1 AND user_fk_id = $2
//                `
//             const parametr = [id, userId]
//             try {
//                 const findUserStatusLike = await this.dataSource.query(qureLikesInfoComments, parametr)

//                 status = findUserStatusLike[0]?.status || statusCommentLike.None;
//                 commentatorInfo = { userId: findUserStatusLike.user_fk_id.toString(), userLogin: findUserStatusLike.user_login }


//             } catch (error) {
//                 console.log(error)
//             }
//         }

//         const qureCountLikeDislike = `
//         SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_comments WHERE likes_info_comments.status = 'Like' AND comments_fk_id = $1)
//         FROM likes_info_comments l
//         WHERE l.status = 'Dislike' AND l.comments_fk_id = $1
//         `

//         const paramtrCountLikeDislike = [id]

//         const resCountLikeDislike = await this.dataSource.query(qureCountLikeDislike, paramtrCountLikeDislike)


//         const mapData: CommentViewModel = {
//             id: result[0].comments_id.toString(),
//             commentatorInfo: commentatorInfo,
//             content: result[0].content,
//             createdAt: result[0].created_at,
//             likesInfo: {
//                 dislikesCount: +resCountLikeDislike[0].count_dislike,
//                 likesCount: +resCountLikeDislike[0].count_like,
//                 myStatus: status,
//             },
//         };

//         return mapData;
//     }

//     async complianceCheckUserComment(commentId: string, userId: string) {
//         const qureComment = `SELECT *
//                         FROM comments
//                         WHERE comments_id = $1;
//         `
//         const parametrComment = [commentId]

//         try {
//             const result = await this.dataSource.query(qureComment, parametrComment)

//             if (result[0].user_fk_id !== userId) {
//                 return {
//                     error: "Forbidden",
//                     status: 'null'
//                 }
//             }

//             return result[0]
//         } catch (e) {
//             return {
//                 error: e,
//                 status: 'null'

//             }
//         }



//     }
//     async findComment(commentId: string) {
//         const findComment = `
//         SELECT
//     c.comments_id,
//     c.content,
//     c.created_at,
//     c.post_id_fk,
//     l.user_fk_id,
//     l.user_login
// FROM
//     comments c
// LEFT JOIN
//     likes_info_comments l
//     ON c.comments_id = l.comments_fk_id
// WHERE
//     c.comments_id = $1;
//         `

//         const parametr = [commentId]

//         const result = await this.dataSource.query(findComment, parametr)


//         return result[0]


//     }

//     async getCommentPosts(IdPost: string, query: any, userId?: string): Promise<Paginator<CommentViewModel> | { error: string }> {


//         const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'

//         const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

//         const queryuUserTable = `
//         SELECT *
//         FROM comments
//         WHERE (LOWER(created_at) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
//         AND post_id_fk = $2
//         ORDER BY ${sortBy} COLLATE "C" ${sortDirection}
//         LIMIT $3 OFFSET $4;
//     `;

//         const parametr = [query.searchNameTerm || '', IdPost, query.pageSize, (query.pageNumber - 1) * query.pageSize];

//         const items = await this.dataSource.query(queryuUserTable, parametr)

//         const commentMap = await this.mapComments(items, userId);

//         const countComments = `
//         SELECT COUNT(*)
//         FROM comments
//         WHERE (LOWER(created_at) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
//         AND post_id_fk = $2
//     `;
//         const parametrCommentCount = [query.searchNameTerm || '', IdPost]
//         const totalItemsResult = await this.dataSource.query(countComments, parametrCommentCount);
//         const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее



//         return {
//             pagesCount: +Math.ceil(totalCount / query.pageSize),
//             page: +query.pageNumber,
//             pageSize: +query.pageSize,
//             totalCount,
//             items: commentMap,
//         };

//     }

//     private async mapComments(items: CommentViewModelDb[], userId?: string): Promise<any[]> {
//         const promises = items.map(async (comment: any) => {

//             const qureCount = `
//             SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_comments WHERE likes_info_comments.status = 'Like' AND comments_fk_id = $1)
//             FROM likes_info_comments c
//             WHERE c.status = 'Dislike' AND comments_fk_id = $1
//             `
//             const parametrCount = [comment.comments_id]

//             const countLikes = await this.dataSource.query(qureCount, parametrCount)

//             const resComment = `
//             SELECT likes_info_comments.user_fk_id, comments_fk_id, user_login
//             FROM comments
//             LEFT JOIN likes_info_comments ON likes_info_comments.comments_fk_id = comments.comments_id
//        `;


//             const findComment = await this.dataSource.query(resComment)

//             const userStatus = `
//              SELECT *
//              FROM likes_info_comments
//              WHERE user_fk_id = $1 AND comments_fk_id = $2
//           `;

//             const parametr = [userId === null ? null : userId, comment.comments_id]

//             const resultUserStatus = await this.dataSource.query(userStatus, parametr)


//             let resultStatus
//             if (!resultUserStatus[0]) {
//                 resultStatus = statusCommentLike.None
//             } else {
//                 resultStatus = resultUserStatus[0]!.status
//             }


//             return {
//                 id: comment.comments_id.toString(),
//                 content: comment.content,
//                 commentatorInfo: {
//                     userId: findComment[0].user_fk_id.toString(),
//                     userLogin: findComment[0].user_login,
//                 },
//                 createdAt: comment.created_at,
//                 likesInfo: {
//                     likesCount: +countLikes[0].count_like,
//                     dislikesCount: +countLikes[0].count_dislike,
//                     myStatus: resultStatus,
//                 },
//             };
//         })


//         const userMapData = await Promise.all(promises)

//         return userMapData;


//     }


// }

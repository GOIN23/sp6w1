import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { PostViewModelLiKeArray } from "../type/typePosts";

@Injectable()
export class PostsQuerySqlRepository {
    constructor(protected dataSource: DataSource) {
    }

    async getById(postId: string, userId?: string) {
        const qureBlog = `
        SELECT *
        FROM posts p
        LEFT JOIN likes_info_posts ON p.post_id = post_fk_id
        WHERE post_id = $1
        `
        const parameter = [postId]

        const qureCount = `
        SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_posts WHERE likes_info_posts.status = 'Like' AND post_fk_id = $1)
        FROM likes_info_posts p
        WHERE p.status = 'Dislike' AND p.post_fk_id = $1
        `





        try {

            const post = await this.dataSource.query(qureBlog, parameter)
            const countLike = await this.dataSource.query(qureCount, parameter)


            console.log(post, countLike, "countLikecountLikecountLikecountLikecountLikecountLikecountLike")


            let userStatus: any = []
            if (userId) {
                const userLike = `
                SELECT *
                FROM likes_info_posts
                WHERE user_fk_id = $1 AND post_fk_id = $2
                `
                const parametrUserLike = [userId, postId]

                userStatus = await this.dataSource.query(userLike, parametrUserLike)

            }




            const countLikeUserQuery = `
            SELECT *
            FROM likes_info_posts i
            WHERE post_fk_id = $1 AND i.status = 'Like'
            ORDER BY i.created_at_inf DESC -- Сортируем по дате, чтобы получить последние лайки
            LIMIT 3; -- Ограничиваем количество последних лайков
        `;
            const parametrCountLikeUser = [postId]

            const resultCountLikeUser = await this.dataSource.query(countLikeUserQuery, parametrCountLikeUser)



            if (!resultCountLikeUser[0]) {

                return {
                    id: post[0].post_id.toString(),
                    title: post[0].title,
                    shortDescription: post[0].short_description,
                    content: post[0].content,
                    blogId: post[0].fk_blog.toString(),
                    blogName: post[0].blog_name,
                    createdAt: post[0].created_at,
                    extendedLikesInfo: {
                        likesCount: +countLike[0].count_like,
                        dislikesCount: +countLike[0].count_dislike,
                        myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                        newestLikes: []
                    }
                }
            }

            return {
                id: post[0].post_id.toString(),
                title: post[0].title,
                shortDescription: post[0].short_description,
                content: post[0].content,
                blogId: post[0].fk_blog.toString(),
                blogName: post[0].blog_name,
                createdAt: post[0].created_at,
                extendedLikesInfo: {
                    likesCount: +countLike[0].count_like,
                    dislikesCount: +countLike[0].count_dislike,
                    myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                    newestLikes: [...resultCountLikeUser.map(el => {
                        return {
                            addedAt: el.created_at_inf,
                            userId: el.user_fk_id.toString(),
                            login: el.user_login
                        }
                    })]
                }
            }


        } catch (error) {
            console.log(error)

        }


    }


    async getPosts(query: QueryPostsParamsDto, userId?: string): Promise<any | { error: string }> {
        query.sortBy === "blogName" ? query.sortBy = "blog_name" : ''
        const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'



        const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

        const queryuUserTable = `
        SELECT *
        FROM posts
        WHERE (LOWER(title) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        ORDER BY ${sortBy} COLLATE "C" ${sortDirection} 
        LIMIT $2 OFFSET $3;
    `;

        const parametr = [query.searchNameTerm || '', query.pageSize, (query.pageNumber - 1) * query.pageSize];

        const items = await this.dataSource.query(queryuUserTable, parametr)


        const userMapData: any[] = await this.mapPosts(items, userId)



        const countQuery = `
        SELECT COUNT(*)
        FROM posts
        WHERE (LOWER(title) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
    `;
        const countParams = [query.searchNameTerm || ''];
        const totalItemsResult = await this.dataSource.query(countQuery, countParams);
        const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее 


        return {
            pagesCount: Math.ceil(totalCount / query.pageSize),
            page: +query.pageNumber,
            pageSize: +query.pageSize,
            totalCount: totalCount,
            items: userMapData,
        };







    }


    async mapPosts(items: any, userId?: string): Promise<PostViewModelLiKeArray[]> {
        const promises = items.map(async (post) => {
            const qureCount = `
        SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_posts WHERE likes_info_posts.status = 'Like' AND post_fk_id = $1)
        FROM likes_info_posts p
        WHERE p.status = 'Dislike' AND p.post_fk_id = $1
        `
            const parameter = [post.post_id]

            const countLike = await this.dataSource.query(qureCount, parameter)



            let userStatus: any[] = []
            if (userId) {
                const userLike = `
                SELECT *
                FROM likes_info_posts
                WHERE user_fk_id = $1 AND post_fk_id = $2
                `
                const parametrUserLike = [userId, post.post_id]

                const res = await this.dataSource.query(userLike, parametrUserLike)
                userStatus.push(res[0])

            }


            // const countLikeUser = `
            // SELECT *
            // FROM likes_info_posts i
            // WHERE post_fk_id = $1 AND i.status = 'Like'
            // `
            // const parametrCountLikeUser = [post.post_id]


            const countLikeUserQuery = `
            SELECT *
            FROM likes_info_posts i
            WHERE post_fk_id = $1 AND i.status = 'Like'
            ORDER BY i.created_at_inf DESC -- Сортируем по дате, чтобы получить последние лайки
            LIMIT 3; -- Ограничиваем количество последних лайков
        `;
            const parametrCountLikeUser = [post.post_id]

            const resultCountLikeUser = await this.dataSource.query(countLikeUserQuery, parametrCountLikeUser)



            if (!resultCountLikeUser[0]) {

                return {
                    id: post.post_id.toString(),
                    title: post.title,
                    shortDescription: post.short_description,
                    content: post.content,
                    blogId: post.fk_blog.toString(),
                    blogName: post.blog_name,
                    createdAt: post.created_at,
                    extendedLikesInfo: {
                        likesCount: +countLike[0].count_like,
                        dislikesCount: +countLike[0].count_dislike,
                        myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                        newestLikes: []
                    }
                }
            }

            return {
                id: post.post_id.toString(),
                title: post.title,
                shortDescription: post.short_description,
                content: post.content,
                blogId: post.fk_blog.toString(),
                blogName: post.blog_name,
                createdAt: post.created_at,
                extendedLikesInfo: {
                    likesCount: +countLike[0].count_like,
                    dislikesCount: +countLike[0].count_dislike,
                    myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                    newestLikes: [...resultCountLikeUser.map(el => {
                        return {
                            addedAt: el.created_at_inf,
                            userId: el.user_fk_id.toString(),
                            login: el.user_login
                        }
                    })]
                }
            }

        })



        const userMapData = await Promise.all(promises)

        return userMapData;


    }


}

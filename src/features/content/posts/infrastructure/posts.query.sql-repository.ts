import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { PostViewModelLiKeArrayDB } from "../type/typePosts";

@Injectable()
export class PostsQuerySqlRepository {
    constructor(protected dataSource: DataSource) {
    }

    public async getById(postId: string, userId?: string) {
        const qureBlog = `
        SELECT *
        FROM posts
        WHERE post_id = $1
        `
        const parameter = [postId]



        try {
            const post = await this.dataSource.query(qureBlog, parameter)

            return {
                id: post[0].post_id.toString(),
                title: post[0].title,
                shortDescription: post[0].short_description,
                content: post[0].content,
                blogId: post[0].fk_blog.toString(),
                blogName: post[0].blog_name,
                createdAt: post[0].created_at,
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: []
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


        const userMapData: PostViewModelLiKeArrayDB[] = items.map((post: any) => {
            return {
                id: post.post_id.toString(),
                title: post.title,
                shortDescription: post.short_description,
                content: post.content,
                blogId: post.fk_blog.toString(),
                blogName: post.blog_name,
                createdAt: post.created_at,
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: []
                }
            };
        });


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


    // public async mapPost(post: PostViewModelTdb, userId?: string): Promise<PostViewModelLiKeArray> {


    //     const dislikesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Dislike" });
    //     const likesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Like" });
    //     const userLikeStatus = await this.likesPostModule.findOne({ postId: post._id, userID: userId })

    //     const newestLikes = await this.likesPostModule.find({ postId: post._id, status: "Like" }).lean()


    //     let countingUserLikes: any
    //     if (newestLikes.length === 1) {
    //         countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }]

    //     } else if (newestLikes.length === 2) {
    //         countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }]

    //     } else if (newestLikes.length === 3) {
    //         countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

    //     } else if (newestLikes.length > 3) {
    //         countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

    //     } else if (newestLikes.length === 0) {
    //         countingUserLikes = []
    //     }

    //     let resultStatus
    //     if (!userLikeStatus) {
    //         resultStatus = statusCommentLike.None
    //     } else {
    //         resultStatus = userLikeStatus!.status
    //     }




    //     return {
    //         id: post._id,
    //         title: post.title,
    //         shortDescription: post.shortDescription,
    //         content: post.content,
    //         blogId: post.blogId,
    //         blogName: post.blogName,
    //         createdAt: post.createdAt,
    //         extendedLikesInfo: {
    //             likesCount: likesCount,
    //             dislikesCount: dislikesCount,
    //             myStatus: resultStatus,
    //             newestLikes: countingUserLikes
    //         }


    //     };
    // }


    // public async mapPosts(items: PostViewModelTdb[], userId?: string): Promise<PostViewModelLiKeArray[]> {
    //     const promises = items.map(async (post: PostViewModelTdb) => {
    //         const dislikesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Dislike" });
    //         const likesCount = await this.likesPostModule.countDocuments({ postId: post._id, status: "Like" });
    //         const userLikeStatus = await this.likesPostModule.findOne({ postId: post._id, userID: userId })

    //         const newestLikes = await this.likesPostModule.find({ postId: post._id, status: "Like" }).lean()


    //         let countingUserLikes: any
    //         if (newestLikes.length === 1) {
    //             countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }]

    //         } else if (newestLikes.length === 2) {
    //             countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }]

    //         } else if (newestLikes.length === 3) {
    //             countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

    //         } else if (newestLikes.length > 3) {
    //             countingUserLikes = [{ addedAt: newestLikes[newestLikes.length - 1].createdAt, userId: newestLikes[newestLikes.length - 1].userID, login: newestLikes[newestLikes.length - 1].login }, { addedAt: newestLikes[newestLikes.length - 2].createdAt, userId: newestLikes[newestLikes.length - 2].userID, login: newestLikes[newestLikes.length - 2].login }, { addedAt: newestLikes[newestLikes.length - 3].createdAt, userId: newestLikes[newestLikes.length - 3].userID, login: newestLikes[newestLikes.length - 3].login }]

    //         } else if (newestLikes.length === 0) {
    //             countingUserLikes = []
    //         }

    //         let resultStatus
    //         if (!userLikeStatus) {
    //             resultStatus = statusCommentLike.None
    //         } else {
    //             resultStatus = userLikeStatus!.status
    //         }


    //         return {
    //             id: post._id,
    //             title: post.title,
    //             shortDescription: post.shortDescription,
    //             content: post.content,
    //             blogId: post.blogId,
    //             blogName: post.blogName,
    //             createdAt: post.createdAt,
    //             extendedLikesInfo: {
    //                 likesCount: likesCount,
    //                 dislikesCount: dislikesCount,
    //                 myStatus: resultStatus,
    //                 newestLikes: countingUserLikes
    //             }


    //         };
    //     })


    //     const userMapData = await Promise.all(promises)

    //     return userMapData;
    // }


}

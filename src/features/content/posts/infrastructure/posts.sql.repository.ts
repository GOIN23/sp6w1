import { Injectable } from '@nestjs/common';

import { PostsCreateModel } from '../models/input/create-posts.input.bodel';
import { PostViewModelLiKeArray } from '../type/typePosts';

import { DataSource } from 'typeorm';
import { CommentViewModelDb, PostLikeT } from '../../comments/type/typeCommen';


@Injectable()
export class PostSqlRepository {
    constructor(protected dataSource: DataSource) { }


    async creatInDbPost(newUser: PostViewModelLiKeArray) {
        const qureBlog = `
        INSERT INTO posts (title, short_description, content, blog_name, created_at, fk_blog)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING post_id
        `
        const parameter = [newUser.title, newUser.shortDescription, newUser.content, newUser.blogName, newUser.createdAt, newUser.blogId]

        try {
            const postId = await this.dataSource.query(qureBlog, parameter)
            return postId[0].post_id


        } catch (error) {
            console.log(error)

        }
    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        const queryuPostTable = `
        UPDATE posts
        SET title = $1, short_description = $2, content = $3, fK_blog = $4
        WHERE post_id = $4;
    `;
        const parameter = [postsModel.title, postsModel.shortDescription, postsModel.content, postsModel.blogId]

        try {
            await this.dataSource.query(queryuPostTable, parameter)

        } catch (error) {
            console.log(error)

        }
    }

    async deletePost(id: string) {
        const queryPostTable = ` 
        DELETE FROM posts
        WHERE post_id = $1
        `

        const parameter = [id]

        try {
            await this.dataSource.query(queryPostTable, parameter)
        } catch (error) {
            console.log(error)
        }

    }

    async createCommentPost(body: CommentViewModelDb): Promise<void> {
        const queryCommentsTable = ` 
        INSERT INTO comments (content, created_at, post_id_fk, user_fk_id)
        VALUES($1, $2, $3, $4)
        RETURNING comments_id
        `

        const parameter = [body.content, body.createdAt, body.IdPost, body.commentatorInfo.userId]


        try {
            const commentsId = await this.dataSource.query(queryCommentsTable, parameter)

            return commentsId[0].comments_id
        } catch (error) {
            console.log(error)
        }




    }

    async createLikeInfoMetaDataComment(body: any): Promise<void> {
        const queryLikesInfosTable = ` 
        INSERT INTO likes_info_comments (user_fk_id, comments_fk_id, created_at_info, status, user_login)
        VALUES($1, $2, $3, $4, $5)
        `

        const parameterLikesInfo = [body.userID, body.commentId, body.createdAt, body.status, body.userLogin]
        try {
            await this.dataSource.query(queryLikesInfosTable, parameterLikesInfo)

        } catch (error) {
            console.log(error)
        }

    }

    async findLikeDislakePost(userID: string, postId: string): Promise<PostLikeT | boolean> {
        const queryPosts = `
        SELECT *
        FROM likes_info_posts 
        WHERE post_fk_id = $1 AND user_fk_id = $2
      `

        const parametr = [postId, userID]

        try {
            const result = await this.dataSource.query(queryPosts, parametr)

            return result[0]
        } catch (error) {
            console.log(error)

        }

    }
    async addLikeDislikeInPosts(likesPostInfo: any) {
        const queryLikesInfosTablePost = ` 
        INSERT INTO likes_info_posts (post_fk_id, status, user_fk_id, user_login,created_at_inf)
        VALUES($1, $2, $3, $4, $5)
        `

        const parameterLikesInfo = [likesPostInfo.postId, likesPostInfo.status, likesPostInfo.userID, likesPostInfo.login, likesPostInfo.createdAt]
        try {
            await this.dataSource.query(queryLikesInfosTablePost, parameterLikesInfo)

        } catch (error) {
            console.log(error)
        }


    }
    async updateLikeStatusInPosts(userId: string, likeStatus: string, postId: string) {
        const queryuPostTable = `
        UPDATE likes_info_posts
        SET status = $1
        WHERE user_fk_id = $2 AND post_fk_id = $3;
    `;
        const parameter = [likeStatus, userId, postId]

        try {
            await this.dataSource.query(queryuPostTable, parameter)

        } catch (error) {
            console.log(error)

        }
    }
}

import { Injectable } from '@nestjs/common';

import { PostsCreateModel } from '../models/input/create-posts.input.bodel';
import { PostViewModelLiKeArray } from '../type/typePosts';

import { DataSource } from 'typeorm';
import { CommentViewModelDb } from '../../comments/type/typeCommen';


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
        INSERT INTO comments (content, created_at, post_id_fk)
        VALUES($1, $2, $3)
        RETURNING comments_id
        `

        const parameter = [body.content, body.createdAt, body.IdPost]


        try {
            const commentsId = await this.dataSource.query(queryCommentsTable, parameter)

            return commentsId[0].comments_id
        } catch (error) {
            console.log(error)
        }




    }

    async createLikeInfoMetaDataComment(body: any): Promise<void> {
        const queryLikesInfosTable = ` 
        INSERT INTO likes_info_comments (user_fk_id, comments_fk_id, created_at, status, user_login)
        VALUES($1, $2, $3, $4, $5)
        `

        const parameterLikesInfo = [body.userID, body.commentId, body.createdAt, body.status, body.userLogin]
        try {
            await this.dataSource.query(queryLikesInfosTable, parameterLikesInfo)

        } catch (error) {
            console.log(error)
        }

    }

    // async findLikeDislakePost(userID: string, postId: string): Promise<PostLikeT | boolean> {
    //     try {
    //         const res = await this.likesPostModule.findOne({ userID: userID, postId: postId });
    //         if (!res) {
    //             return false;
    //         }
    //         return true;
    //     } catch {
    //         return false

    //     }

    // }
    // async addLikeDislikeInPosts(likesPostInfo: any) {
    //     await this.likesPostModule.insertMany(likesPostInfo);
    // }
    // async updateLikeStatusInPosts(userId: string, likeStatus: string, postId: string) {
    //     await this.likesPostModule.updateOne({ userID: userId, postId: postId }, { $set: { status: likeStatus } });
    // }
}

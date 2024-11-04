import { Injectable } from '@nestjs/common';

import { PostsCreateModel } from '../models/input/create-posts.input.bodel';
import { PostViewModelLiKeArray } from '../type/typePosts';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentsEntityT } from '../../comments/domain/comments.entityT';
import { LikesInfoCommentsEntityT } from '../../comments/domain/likes.comments.entityT';
import { CommentViewModelDb } from '../../comments/type/typeCommen';
import { LikesInfoPostsEntityT } from '../domain/likes.posts.entityT';
import { PostsEntityT } from '../domain/posts.entityT';


@Injectable()
export class PostSqlRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(PostsEntityT) protected posts: Repository<PostsEntityT>,
        @InjectRepository(CommentsEntityT) protected comments: Repository<CommentsEntityT>,
        @InjectRepository(LikesInfoCommentsEntityT) protected likesInfoComments: Repository<LikesInfoCommentsEntityT>,
        @InjectRepository(LikesInfoPostsEntityT) protected likesInfoPosts: Repository<LikesInfoPostsEntityT>,


    ) { }


    async creatInDbPost(newPost: PostViewModelLiKeArray) {
        try {
            const result = await this.posts.insert({
                blogName: newPost.blogName,
                content: newPost.content,
                createdAt: newPost.createdAt,
                shortDescription: newPost.shortDescription,
                title: newPost.title,
                blogs: () => newPost.blogId
            });


            return result.identifiers[0].postId;

        } catch (error) {
            console.log(error)

        }
    }

    async updatePost(blogId: string, postsModel: PostsCreateModel) {

        try {
            const result = await this.posts
                .createQueryBuilder()
                .update(PostsEntityT)
                .set({
                    title: postsModel.title, shortDescription: postsModel.shortDescription, content: postsModel.content
                }) // Устанавливаем isConfirmed в true
                .where('blogIdFk = :blogId', { blogId }) // Фильтруем по userId
                .execute(); // Выполняем запрос


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error confirming email:', error);
            return false; // Возвращаем false в случае ошибки
        }


    }

    async deletePost(postId: string) {
        try {
            const result = await this.posts.delete({ postId: +postId })


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error confirming email:', error);
            return false; // Возвращаем false в случае ошибки
        }



    }

    async createCommentPost(body: CommentViewModelDb): Promise<void> {
        const result = await this.comments.insert({
            content: body.content,
            createdAt: body.createdAt,
            posts: () => body.IdPost,
            users: () => body.commentatorInfo.userId,
        })

        return result.identifiers[0].commentsId;



    }

    async createLikeInfoMetaDataComment(body: any): Promise<void> {


        await this.likesInfoComments.insert({
            createdAt: body.createdAt,
            status: body.status,
            comments: body.commentId,
            users: body.userID,


        })



    }

    async findLikeDislakePost(userID: string, postId: string): Promise<LikesInfoPostsEntityT | boolean> {

        try {
            const likesInfoPosts = await this.likesInfoPosts.createQueryBuilder('l').where('l.postsId = :postId', { postId }).andWhere('l.userFkId = :userID', { userID }).getOne()
            return likesInfoPosts

        } catch (error) {

            console.log(error)
        }




    }
    async addLikeDislikeInPosts(likesPostInfo: any) {

        try {
            await this.likesInfoPosts.insert({
                posts: likesPostInfo.postId,
                createdAt: likesPostInfo.createdAt,
                status: likesPostInfo.status,
                users: likesPostInfo.userID
            })
        } catch (error) {
            console.log(error)

        }

    }
    async updateLikeStatusInPosts(userId: string, likeStatus: string, postId: string) {

        try {
            await this.likesInfoPosts
                .createQueryBuilder()
                .update(LikesInfoPostsEntityT)
                .set({ status: likeStatus })
                .where('postsId = :postId', { postId })
                .andWhere('userFkId = :userId', { userId })
                .execute(); // Выполняем запрос

        } catch (error) {
            console.log(error)

        }





    }
}

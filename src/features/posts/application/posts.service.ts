import { Injectable } from '@nestjs/common';

import { PostsCreateModel } from "../models/input/create-posts.input.bodel";
import { PostViewModelLiKeArray, statusCommentLike } from "../type/typePosts";
import { PostRepository } from "../infrastructure/posts.repository";
import { BlogOutputModel } from 'src/features/blogs/models/output/blog.output.model';
// import { BlogOutputModel } from "src/blogs/models/output/blog.output.model";


@Injectable()
export class PostsService {
    constructor(private postRepository: PostRepository) { }

    async creatPosts(postsModel: PostsCreateModel, blog: BlogOutputModel) {

        const newUser: PostViewModelLiKeArray = {
            blogId: postsModel.blogId,
            blogName: blog.name,
            content: postsModel.content,
            createdAt: new Date().toISOString(),
            shortDescription: postsModel.shortDescription,
            title: postsModel.title,
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: statusCommentLike.None,
                newestLikes: []
            }


        }
        return await this.postRepository.creatInDbPost(newUser)

    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        await this.postRepository.updatePost(id, postsModel)
    }


    async deletePost(id: string) {
        await this.postRepository.deletePost(id)
    }

}
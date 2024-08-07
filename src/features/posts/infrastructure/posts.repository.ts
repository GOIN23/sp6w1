import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Posts } from '../domain/posts.entity';
import { PostViewModelLiKeArray } from '../type/typePosts';
import { PostsCreateModel } from '../models/input/create-posts.input.bodel';


@Injectable()
export class PostRepository {
    constructor(@InjectModel(Posts.name) private postModel: Model<Posts>) { }


    async creatInDbPost(newUser: PostViewModelLiKeArray) {
        const result = await this.postModel.insertMany(newUser)
        return result[0]._id.toString();
    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        await this.postModel.updateOne(
            { _id: id },
            { $set: { content: postsModel.content, blogId: postsModel.blogId, shortDescription: postsModel.shortDescription, title: postsModel.title } }
        );
    }

    async deletePost(id:string){
        await this.postModel.deleteOne({ _id: id });

    }



}

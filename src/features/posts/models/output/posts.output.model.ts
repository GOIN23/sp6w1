// import { extendedLikesInfo } from "src/posts/type/typePosts";

import { extendedLikesInfo } from "../../type/typePosts"





export class postsOutputModel {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: boolean
    createdAt: string
    extendedLikesInfo: extendedLikesInfo
}

// MAPPERS

export const postOutputModelMapper = (post: any): postsOutputModel => {
    const outputModel = new postsOutputModel();

    outputModel.id = post._id.toString();
    outputModel.blogName = post.blogName;
    outputModel.blogId = post.blogId
    outputModel.content = post.content;
    outputModel.createdAt = post.createdAt
    outputModel.shortDescription = post.shortDescription
    outputModel.title = post.title
    outputModel.extendedLikesInfo = {
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        likesCount: post.extendedLikesInfo.likesCount,
        myStatus: post.extendedLikesInfo.myStatus,
        newestLikes: post.extendedLikesInfo.newestLikes
    }

    return outputModel;
};

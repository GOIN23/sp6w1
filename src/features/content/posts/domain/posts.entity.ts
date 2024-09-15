import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PostsDocument = HydratedDocument<Posts>;




@Schema()
export class NewestLike {
    @Prop({ required: true })
    addedAt: Date;  // лучше использовать Date вместо string
    @Prop({ required: true })
    userId: string;
    @Prop({ required: true })
    login: string;
}

@Schema()
export class ExtendedLikesInfo {
    @Prop({ required: true, default: 0 })
    likesCount: number;

    @Prop({ required: true, default: 0 })
    dislikesCount: number;

    @Prop({ required: true, default: 'None' })
    myStatus: string;

    @Prop({ type: [NewestLike], default: [] })  // массив объектов
    newestLikes: NewestLike[];
}



@Schema()
export class Posts {
    @Prop({
        required: true
    })
    title: string;

    @Prop({
        required: true
    })
    shortDescription: string;

    @Prop({
        required: true
    })
    content: string;

    @Prop({
        required: true
    })
    blogId: string
    @Prop({
        required: true
    })
    blogName: string
    @Prop({
        required: true
    })
    createdAt: string
    @Prop({
        required: true
    })
    extendedLikesInfo: ExtendedLikesInfo

}

export const PostSchema = SchemaFactory.createForClass(Posts);
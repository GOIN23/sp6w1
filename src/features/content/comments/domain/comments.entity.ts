import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CommentsDocument = HydratedDocument<Comments>;




@Schema()
export class CommentatorInfoSchema {
    @Prop({
        required: true
    })
    userId: string

    @Prop({
        required: true
    })
    userLogin: string

}


@Schema()
export class LikesInfo {
    @Prop({ required: true, default: 0 })
    likesCount: number;

    @Prop({ required: true, default: 0 })
    dislikesCount: number;

    @Prop({ required: true, default: 'None' })
    myStatus: string;
}

@Schema()
export class Comments {
    @Prop({
        required: true
    })
    commentatorInfo: CommentatorInfoSchema;

    @Prop({
        required: true
    })
    content: string;

    @Prop({
        required: true
    })
    createdAt: string;

    @Prop({
        required: true
    })
    IdPost: string
    @Prop({
        required: true
    })
    likesInfo: LikesInfo


}

export const CommentSchema = SchemaFactory.createForClass(Comments);
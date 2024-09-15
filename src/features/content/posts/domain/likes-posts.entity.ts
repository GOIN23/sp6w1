import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LikesPostsDocument = HydratedDocument<LikesPostInfo>;








@Schema()
export class LikesPostInfo {
    @Prop({ required: true })
    postId: string;

    @Prop({ required: true })
    createdAt: string;

    @Prop({ required: true })
    status: string;

    @Prop({ required: true })

    userID: string
    @Prop({ required: true })

    login: string
}






export const LLikesPostInfoSchema = SchemaFactory.createForClass(LikesPostInfo);
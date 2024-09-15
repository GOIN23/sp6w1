import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LikesCommentsDocument = HydratedDocument<LikesCommentsInfo>;









@Schema()
export class LikesCommentsInfo {
    @Prop({ required: true })
    commentId: string;

    @Prop({ required: true })
    createdAt: string;

    @Prop({ required: true })
    status: string;

    @Prop({ required: true })

    userID: string
}






export const LikesCommentsSchema = SchemaFactory.createForClass(LikesCommentsInfo);
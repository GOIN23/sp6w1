import { IsEnum } from "class-validator";
import { statusCommentLike } from "../../type/typeCommen";

export class PutLikeComment {
    @IsEnum(statusCommentLike)
    likeStatus: statusCommentLike
}
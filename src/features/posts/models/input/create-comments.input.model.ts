import { IsString, Length } from "class-validator";
import { Trim } from "src/utilit/decorators/transform/trim";


export class CommentPosts {
    @Trim()
    @Length(20, 300)
    @IsString()
    content: string
}
import { IsString, Length } from "class-validator";
import { Trim } from "../../../../../utilit/decorators/transform/trim"


export class PutCommentsModel {
    @Trim()
    @IsString()
    @Length(29, 300)
    content: string
}


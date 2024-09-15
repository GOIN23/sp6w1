import { IsString, Length, Matches, MaxLength } from "class-validator";
import { Trim } from "../../../../../utilit/decorators/transform/trim"
import { IsOptionalEmail } from "../../../../../utilit/decorators/validate/is-optional-email"


export class BlogPostCreateModel {
    @Trim()
    @IsString()
    @MaxLength(30)
    title: string

    @IsOptionalEmail()
    @MaxLength(100)
    shortDescription: string

    @MaxLength(1000)
    content: string
}


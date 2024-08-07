import { IsString, Length, Matches, MaxLength } from "class-validator";
import { Trim } from "src/utilit/decorators/transform/trim";
import { IsOptionalEmail } from "src/utilit/decorators/validate/is-optional-email";


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


import { IsString, Length, Matches, MaxLength } from "class-validator";
import { Trim } from "src/utilit/decorators/transform/trim";


export class BlogCreateModel {
    @Trim()
    @IsString()
    @MaxLength(15)
    name: string

    @MaxLength(500)
    description: string

    @MaxLength(100)
    @Matches("^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$")
    websiteUrl: string
}


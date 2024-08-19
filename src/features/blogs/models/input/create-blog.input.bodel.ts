import { IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";
import { Trim } from "src/utilit/decorators/transform/trim";


export class BlogCreateModel {
    @Trim()
    @IsString()
    @IsNotEmpty({ message: 'Login is required' })
    @MaxLength(15)
    name: string

    @MaxLength(500)
    @IsNotEmpty({ message: 'Login is required' })
    description: string

    @MaxLength(100)
    @IsNotEmpty({ message: 'Login is required' })
    @Matches("^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$")
    websiteUrl: string
}


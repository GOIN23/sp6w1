import { IsMongoId, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { NameIsExist } from "../../../../../utilit/decorators/transform/blogFind";
import { Trim } from "../../../../../utilit/decorators/transform/trim"


export class PostsCreateModel {
    @Trim()
    @IsString()
    @IsNotEmpty({ message: 'Login is required' })
    @MaxLength(30)
    title: string

    @MaxLength(100)
    @IsNotEmpty({ message: 'Login is required' })
    shortDescription: string

    @Trim()
    @MaxLength(1000)
    @IsNotEmpty({ message: 'Login is required' })
    content: string


    @IsString()
    @IsOptional()
    @NameIsExist()
    blogId: string
}



export class PostsCreateModel2 {
    @Trim()
    @IsString()
    @MaxLength(30)
    title: string

    @MaxLength(100)
    shortDescription: string

    @MaxLength(1000)
    content: string


}


import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Query, Request } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { DefaultValuesPipe, QueryBlogsParamsDto } from "./blogs/dto/dto.query.body";
import { BlogsSqlQueryRepository } from "./blogs/infrastructure/blogs.query.sql-repository";
import { PostsQuerySqlRepository } from "./posts/infrastructure/posts.query.sql-repository";





@Controller('blogs')
export class BlogsControllerGet {
    constructor(protected jwtService: JwtService, protected blogsSqlQueryRepository: BlogsSqlQueryRepository, protected postsQuerySqlRepository: PostsQuerySqlRepository) { }



    @Get("")
    @HttpCode(200)
    async getBlogs(@Query(new DefaultValuesPipe()) qurePagination: QueryBlogsParamsDto) {
        const blogs = await this.blogsSqlQueryRepository.getBlogs(qurePagination)

        return blogs
    }
    @Get("/:id")
    @HttpCode(200)
    async getBlogById(@Param("id") id: string) {

        const blog = await this.blogsSqlQueryRepository.getById(id)

        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        return blog
    }

    @Get("/:id/posts")
    @HttpCode(200)
    async getBlogByIdPosts(@Param("id") id: string, @Query(new DefaultValuesPipe()) qurePagination: QueryBlogsParamsDto, @Request() req) {
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : null

        const blog = await this.blogsSqlQueryRepository.getById(id,)



        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        return await this.blogsSqlQueryRepository.getBlogsPosts(qurePagination, id, userId)
    }




}



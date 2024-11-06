import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from "../../../utilit/guards/basic-auth-guards";
import { PostsService } from "../posts/application/posts.service";
import { PostsQueryRepository } from "../posts/infrastructure/posts.query-repository";
import { PostsQuerySqlRepository } from "../posts/infrastructure/posts.query.sql-repository";
import { PostsCreateModel2 } from "../posts/models/input/create-posts.input.bodel";
import { BlogService } from "./application/blog.service";
import { DefaultValuesPipe, QueryBlogsParamsDto } from "./dto/dto.query.body";
import { BlogsSqlQueryRepository } from "./infrastructure/blogs.query.sql-repository";
import { BlogCreateModel } from "./models/input/create-blog.input.bodel";






@Controller('sa/blogs')
export class BlogsController {
    constructor(protected blogService: BlogService, protected postsService: PostsService, protected postsQueryRepository: PostsQueryRepository, protected jwtService: JwtService, protected blogsSqlQueryRepository: BlogsSqlQueryRepository, protected postsQuerySqlRepository: PostsQuerySqlRepository) { }

    @Post("")
    @UseGuards(AuthGuard)
    @HttpCode(201)
    async createBlog(@Body() blogModel: BlogCreateModel) {
        const blogId = await this.blogService.creatBlog(blogModel)

        const blog = await this.blogsSqlQueryRepository.getById(blogId)
        return blog.data
    }

    @Post("/:id/posts")
    @UseGuards(AuthGuard)
    @HttpCode(201)
    async createBlogPosts(@Param("id") id: string, @Body() postsModel: PostsCreateModel2, @Request() req) {

        const blog = await this.blogsSqlQueryRepository.getById(id)

        postsModel.blogId = blog.data.id

        let payload: any

        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }


        if (!blog.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        const postId = await this.postsService.creatPosts(postsModel, blog.data)



        const userId: string = payload ? payload.userId : null


        const post = await this.postsQuerySqlRepository.getById(postId.data, userId)


        return post.data
    }

    @Get("")
    @UseGuards(AuthGuard)
    @HttpCode(200)
    async getBlogs(@Query(new DefaultValuesPipe()) qurePagination: QueryBlogsParamsDto) {
        const blogs = await this.blogsSqlQueryRepository.getBlogs(qurePagination)

        return blogs.data
    }

    @Get("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(200)
    async getBlogById(@Param("id") id: string) {

        const blog = await this.blogsSqlQueryRepository.getById(id)

        if (!blog.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        return blog.data
    }

    @Get("/:id/posts")
    @UseGuards(AuthGuard)
    // Использование ValidationPipe
    @HttpCode(200)
    async getBlogByIdPosts(@Param("id") id: string, @Query(new DefaultValuesPipe()) qurePagination: QueryBlogsParamsDto, @Request() req) {

        let payload
        try {

            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId: string = payload ? payload.userId : null

        const blog = await this.blogsSqlQueryRepository.getById(id)



        if (!blog.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        const blogs = await this.blogsSqlQueryRepository.getBlogsPosts(qurePagination, id, userId)

        return blogs.data
    }

    @Put("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async putBlogById(@Param("id") id: string, @Body() blogModel: BlogCreateModel) {

        const blog = await this.blogsSqlQueryRepository.getById(id)

        if (!blog.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.blogService.updateBlog(id, blogModel)
    }

    @Put("/:blogId/posts/:postId")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async putBlogPost(@Param("blogId") blogId: string, @Param("postId") postId: string, @Body() postModel: PostsCreateModel2) {

        const blog = await this.blogsSqlQueryRepository.getById(blogId)

        if (!blog.result) {
            throw new HttpException('blog not found', HttpStatus.NOT_FOUND);
        }

        postModel.blogId = blog.data.id


        const post = await this.postsQuerySqlRepository.getById(postId)
        if (!post.result) {
            throw new HttpException('post not found', HttpStatus.NOT_FOUND);
        }

        await this.postsService.updatePost(postId, postModel)

    }

    @Delete("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async deletBlogById(@Param("id") id: string) {

        const blog = await this.blogsSqlQueryRepository.getById(id)

        if (!blog.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.blogService.deletBlog(id)
    }

    @Delete("/:blogId/posts/:postId")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async deletBlogByPostId(@Param("blogId") blogId: string, @Param("postId") postId: string) {

        const blog = await this.blogsSqlQueryRepository.getById(blogId)

        if (!blog.result) {
            throw new HttpException('blog not found', HttpStatus.NOT_FOUND);
        }

        const post = await this.postsQuerySqlRepository.getById(postId)
        if (!post.result) {
            throw new HttpException('post not found', HttpStatus.NOT_FOUND);
        }

        await this.postsService.deletePost(postId)
    }


}


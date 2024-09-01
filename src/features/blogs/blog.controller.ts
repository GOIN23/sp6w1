import { PostsService } from './../posts/application/posts.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { BlogService } from "./application/blog.service";
import { BlogCreateModel } from "./models/input/create-blog.input.bodel";
import { BlogsQueryRepository } from "./infrastructure/blogs.query-repository";
import { DefaultValuesPipe, QueryBlogsParamsDto } from "./dto/dto.query.body";
import { PostsQueryRepository } from '../posts/infrastructure/posts.query-repository';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../utilit/guards/basic-auth-guards';
import { PostsCreateModel } from '../posts/models/input/create-posts.input.bodel';
import { NumberPipe } from 'src/utilit/pipe/number.pipe';
// import { PostsCreateModel } from "src/posts/models/input/create-posts.input.bodel";
// import { PostsQueryRepository } from 'src/posts/infrastructure/posts.query-repository';





@Controller('blogs')
export class BlogsController {
    constructor(protected blogService: BlogService, protected blogsQueryRepository: BlogsQueryRepository, protected postsService: PostsService, protected postsQueryRepository: PostsQueryRepository, protected jwtService: JwtService) { }

    @Post("")
    @UseGuards(AuthGuard)
    @HttpCode(201)
    async createBlog(@Body() blogModel: BlogCreateModel) {


        const blogId = await this.blogService.creatBlog(blogModel)

        return await this.blogsQueryRepository.getById(blogId)
    }

    @Post("/:id/posts")
    @UseGuards(AuthGuard)
    @HttpCode(201)
    async createBlogPosts(@Param("id") id: string, @Body() postsModel: PostsCreateModel, @Request() req) {

        const blog = await this.blogsQueryRepository.getById(id)

        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        postsModel.blogId = blog.id

        const postId = await this.postsService.creatPosts(postsModel, blog)
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : "null"


        return await this.postsQueryRepository.getById(postId, userId)
    }

    @Get("")
    @HttpCode(200)
    async getBlogs(@Query(new DefaultValuesPipe()) qurePagination: QueryBlogsParamsDto) {
        console.log(qurePagination, "qurePaginationqurePaginationqurePaginationqurePagination")
        const blogs = await this.blogsQueryRepository.getBlogs(qurePagination)

        return blogs
    }
    @Get("/:id")
    @HttpCode(200)
    async getBlogById(@Param("id") id: string) {

        const blog = await this.blogsQueryRepository.getById(id)

        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        return blog
    }

    @Get("/:id/posts")
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

        const userId = payload ? payload.userId : "null"

        const blog = await this.blogsQueryRepository.getById(id,)



        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        return await this.blogsQueryRepository.getBlogsPosts(qurePagination, id, userId)
    }

    @Put("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async putBlogById(@Param("id") id: string, @Body() blogModel: BlogCreateModel) {

        const blog = await this.blogsQueryRepository.getById(id)

        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.blogService.updateBlog(id, blogModel)
    }

    @Delete("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async deletBlogById(@Param("id") id: string) {

        const blog = await this.blogsQueryRepository.getById(id)

        if (!blog) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.blogService.deletBlog(id)
    }


}



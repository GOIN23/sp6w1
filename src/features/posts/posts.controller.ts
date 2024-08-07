import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { PostsService } from "./application/posts.service";
import { PostsQueryRepository } from "./infrastructure/posts.query-repository";
import { PostsCreateModel } from "./models/input/create-posts.input.bodel";
import { QueryPostsParamsDto } from "./models/input/query-posts.input";
import { BlogsQueryRepository } from "../blogs/infrastructure/blogs.query-repository";
import { DefaultValuesPipe } from "../blogs/dto/dto.query.body";







@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService, protected postsQueryRepository: PostsQueryRepository, protected blogsQueryRepository: BlogsQueryRepository) { }

    @Post("")
    @HttpCode(201)
    async createPost(@Body() postsModel: PostsCreateModel) {
        const blogId = await this.blogsQueryRepository.getById(postsModel.blogId)


        if (!blogId) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        const postId = await this.postsService.creatPosts(postsModel, blogId)


        return await this.postsQueryRepository.getById(postId)
    }


    @Get("")
    @UsePipes(new DefaultValuesPipe()) // Использование ValidationPipe
    @HttpCode(200)
    async getPosts(@Query() qurePagination: QueryPostsParamsDto) {

        const posts = await this.postsQueryRepository.getPosts(qurePagination)

        return posts

    }

    @Get("/:id")
    @HttpCode(200)
    async getPostById(@Param("id") id: string) {

        const posts = await this.postsQueryRepository.getById(id)

        if (!posts) {
            throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);


        }

        return posts

    }


    @Put("/:id")
    @HttpCode(204)
    async putPostById(@Param("id") id: string, @Body() postsModel: PostsCreateModel) {

        const post = await this.postsQueryRepository.getById(id)

        if (!post) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);

        }

        const blog = await this.blogsQueryRepository.getById(postsModel.blogId)

        if (!blog) {
            throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

        }

        await this.postsService.updatePost(id, postsModel)
    }

    @Delete("/:id")
    @HttpCode(204)
    async deletePostById(@Param("id") id: string,) {

        const post = await this.postsQueryRepository.getById(id)

        if (!post) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);

        }

        await this.postsService.deletePost(id)
    }




}


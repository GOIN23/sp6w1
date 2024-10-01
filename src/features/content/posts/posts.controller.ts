import { PostsQuerySqlRepository } from './infrastructure/posts.query.sql-repository';
import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Req, Request, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { PostsService } from "./application/posts.service";
import { PostsQueryRepository } from "./infrastructure/posts.query-repository";
import { PostsCreateModel } from "./models/input/create-posts.input.bodel";
import { QueryPostsParamsDto } from "./models/input/query-posts.input";
import { CommentPosts } from "./models/input/create-comments.input.model";
import { JwtService } from "@nestjs/jwt";
import { CommentsQueryRepository } from "../comments/infrastructure/comments-query-repository";
import { JwtAuthGuardPassport } from "src/utilit/strategies/jwt-auth-strategies";
import { RefreshGuard } from "src/utilit/guards/refresh-auth-guard";
import { BlogsQueryRepository } from "../blogs/infrastructure/blogs.query-repository";
import { AuthGuard } from "src/utilit/guards/basic-auth-guards";
import { LoggingInterceptor } from "src/utilit/interceptors/login-inte";
import { PutLikeComment } from "../comments/models/input/put-like-comments.input.mode;";
import { UsersService } from "src/features/user/application/users.service";
import { DefaultValuesPipe } from "../blogs/dto/dto.query.body";
import { JwtAuthGuard } from "src/utilit/guards/jwt-auth-guards";







@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService, protected postsQueryRepository: PostsQueryRepository, protected blogsQueryRepository: BlogsQueryRepository, protected jwtService: JwtService, protected usersService: UsersService, protected commentsQueryRepository: CommentsQueryRepository, protected postsQuerySqlRepository:PostsQuerySqlRepository) { }

    // @Post("")
    // @UseGuards(AuthGuard)
    // @HttpCode(201)
    // async createPost(@Body() postsModel: PostsCreateModel) {
    //     const blogId = await this.blogsQueryRepository.getById(postsModel.blogId)


    //     if (!blogId) {
    //         throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    //     }

    //     const postId = await this.postsService.creatPosts(postsModel, blogId)


    //     return await this.postsQueryRepository.getById(postId)
    // }

    // @Post("/:id/comments")
    // @UseGuards(JwtAuthGuardPassport, RefreshGuard)// Это единсвтенное место где я использую passportJwt
    // @HttpCode(201)
    // async creatComments(@Body() commentPosts: CommentPosts, @Param("id") id: string, @Request() req) {
    //     const post = await this.postsQueryRepository.getById(id);



    //     if (!post) {
    //         throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    //     }

    //     const resulComment = await this.postsService.createCommentPost(commentPosts.content, req.user, post.id);

    //     return resulComment
    // }

    // @Get("/:id/comments")
    // @HttpCode(200)
    // async getComments(@Param("id") id: string, @Query(new DefaultValuesPipe()) qurePagination: QueryPostsParamsDto, @Request() req,) {
    //     let payload
    //     try {
    //         const res = req.headers.authorization.split(' ')[1]
    //         payload = this.jwtService.verify(res)
    //     } catch (error) {
    //         console.log(error)
    //     }

    //     const userId = payload ? payload.userId : "null"


    //     const post = await this.postsQueryRepository.getById(id);

    //     if (!post) {
    //         throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    //     }



    //     const commetns = await this.commentsQueryRepository.getCommentPosts(post.id, qurePagination, userId);

    //     return commetns

    // }


    @Get("")
    @UseInterceptors(LoggingInterceptor)
    @UsePipes(new DefaultValuesPipe()) // Использование ValidationPipe
    @HttpCode(200)
    async getPosts(@Query() qurePagination: QueryPostsParamsDto, @Request() req) {
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : "null"

        const posts = await this.postsQuerySqlRepository.getPosts(qurePagination, userId)

        return posts

    }

    @Get("/:id")
    @HttpCode(200)
    async getPostById(@Param("id") id: string, @Request() req) {
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : "null"

        const posts = await this.postsQuerySqlRepository.getById(id, userId)

        if (!posts) {
            throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);


        }

        return posts

    }

    // @Put("/:id/like-status")
    // @UseGuards(JwtAuthGuard, RefreshGuard)
    // @HttpCode(204)
    // async putLikeStatusPosts(@Param("id") id: string, @Body() likeStatusModel: PutLikeComment, @Request() req) {

    //     const posts = await this.postsQueryRepository.getById(id)

    //     if (!posts) {
    //         throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);
    //     }

    //     await this.postsService.updatePostsLikeDeslike(likeStatusModel.likeStatus, id, req.user.userId || "null", req.user.userLogin || "null");


    // }


    // @Put("/:id")
    // @UseGuards(AuthGuard, RefreshGuard)
    // @HttpCode(204)
    // async putPostById(@Param("id") id: string, @Body() postsModel: PostsCreateModel) {

    //     const post = await this.postsQueryRepository.getById(id)

    //     if (!post) {
    //         throw new HttpException('Post not found', HttpStatus.NOT_FOUND);

    //     }

    //     const blog = await this.blogsQueryRepository.getById(postsModel.blogId)

    //     if (!blog) {
    //         throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);

    //     }

    //     await this.postsService.updatePost(id, postsModel)
    // }

    // @Delete("/:id")
    // @UseGuards(AuthGuard, RefreshGuard)
    // @HttpCode(204)
    // async deletePostById(@Param("id") id: string,) {

    //     const post = await this.postsQueryRepository.getById(id)

    //     if (!post) {
    //         throw new HttpException('Post not found', HttpStatus.NOT_FOUND);

    //     }

    //     await this.postsService.deletePost(id)
    // }




}


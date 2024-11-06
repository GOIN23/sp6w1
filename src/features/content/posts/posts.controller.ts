import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards, UseInterceptors, UsePipes } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../../utilit/guards/jwt-auth-guards";
import { LoggingInterceptor } from "../../../utilit/interceptors/login-inte";
import { JwtAuthGuardPassport } from "../../../utilit/strategies/jwt-auth-strategies";
import { UsersService } from "../../user/application/users.service";
import { DefaultValuesPipe } from "../blogs/dto/dto.query.body";
import { CommentsQueryRepository } from "../comments/infrastructure/comments-query-repository";
import { CommentsQuerySqlRepository } from "../comments/infrastructure/comments.sql.query.repository";
import { PutLikeComment } from "../comments/models/input/put-like-comments.input.mode;";
import { PostsService } from "./application/posts.service";
import { PostsQueryRepository } from "./infrastructure/posts.query-repository";
import { PostsQuerySqlRepository } from './infrastructure/posts.query.sql-repository';
import { CommentPosts } from "./models/input/create-comments.input.model";
import { QueryPostsParamsDto } from "./models/input/query-posts.input";







@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService, protected postsQueryRepository: PostsQueryRepository, protected jwtService: JwtService, protected usersService: UsersService, protected commentsQueryRepository: CommentsQueryRepository, protected postsQuerySqlRepository: PostsQuerySqlRepository, protected commentsQuerySqlRepository: CommentsQuerySqlRepository) { }


    @Post("/:postId/comments")
    @UseGuards(JwtAuthGuardPassport)// Это единсвтенное место где я использую passportJwt
    @HttpCode(201)
    async creatComments(@Body() commentPosts: CommentPosts, @Param("postId") id: string, @Request() req) {
        debugger
        const post = await this.postsQuerySqlRepository.getById(id);


        if (!post) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        const resulComment = await this.postsService.createCommentPost(commentPosts.content, req.user, post.data.id);

        return resulComment
    }

    @Get("/:id/comments")
    @HttpCode(200)
    async getComments(@Param("id") id: string, @Query(new DefaultValuesPipe()) qurePagination: QueryPostsParamsDto, @Request() req,) {
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : null


        const post = await this.postsQuerySqlRepository.getById(id, userId);

        if (!post) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }



        const commetns = await this.commentsQuerySqlRepository.getCommentPosts(post.data.id, qurePagination, userId);

        return commetns

    }

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

        const userId: string = payload ? payload.userId : null

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

        const userId: string = payload ? payload.userId : null

        const posts = await this.postsQuerySqlRepository.getById(id, userId)

        if (!posts) {
            throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);


        }

        return posts

    }

    @Put("/:id/like-status")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async putLikeStatusPosts(@Param("id") id: string, @Body() likeStatusModel: PutLikeComment, @Request() req) {


        const posts = await this.postsQuerySqlRepository.getById(id)


        if (!posts) {
            throw new HttpException('Posts not found', HttpStatus.NOT_FOUND);
        }

        await this.postsService.updatePostsLikeDeslike(likeStatusModel.likeStatus, id, req.user.userId, req.user.userLogin);


    }


}


import { Body, Controller, Delete, ForbiddenException, Get, Headers, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { PutCommentsModel } from "../models/input/put-comments.input.bodel";
import { CommentsQueryRepository } from "../infrastructure/comments-query-repository";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "src/utilit/guards/jwt-auth-guards";
import { CommentPosts } from "src/features/posts/models/input/create-comments.input.model";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCommentCommand } from "../application/use-case/update-use-case";
import { DeleteCommentCommand } from "../application/use-case/delete-use-case";
import { PutLikeComment } from "../models/input/put-like-comments.input.mode;";
import { UpdateLIkeDeslikeCommentCommand } from "../application/use-case/updateLileOnComment-use-case";







@Controller('comments')
export class CommentsController {
    constructor(protected commentsQueryRepository: CommentsQueryRepository, protected jwtService: JwtService, private commandBuse: CommandBus) { }


    @Get("/:id")
    @HttpCode(200)
    async getByIdCommentst(@Param("id") id: string, @Request() req) {
        let payload
        try {
            const res = req.headers.authorization.split(' ')[1]
            payload = this.jwtService.verify(res)
        } catch (error) {
            console.log(error)
        }

        const userId = payload ? payload.userId : "null"

        const comment = await this.commentsQueryRepository.getCommentById(id, userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);
        }

        return comment

    }

    @Put("/:id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async updateComment(@Param("id") id: string, @Body() commetModel: CommentPosts, @Request() req,) {

        const comment = await this.commentsQueryRepository.getCommentById(id, req.user.userId || "null")

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);


        }

        if (comment.commentatorInfo.userId !== req.user.userId) {
            throw new ForbiddenException();
        }

        await this.commandBuse.execute(new UpdateCommentCommand(commetModel.content, id))




    }

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async deleteCommentById(@Param("id") id: string, @Request() req) {
        let userId: string
        if (!req.user.userId) {
            userId = "null";
        }
        const comment = await this.commentsQueryRepository.getCommentById(id, userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);

        }

        if (comment.commentatorInfo.userId !== req.user.userId) {
            throw new ForbiddenException();
        }

        await this.commandBuse.execute(new DeleteCommentCommand(id))

    }


    @Put("/:id/like-status")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async commentLikeStatus(@Param("id") id: string, @Body() likeCommentModel: PutLikeComment, @Request() req,) {
        let userId: string = req.user.userId
        if (!req.user.userId) {
            userId = "null";
        }
        const comment = await this.commentsQueryRepository.getCommentById(id, userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);


        }


        await this.commandBuse.execute(new UpdateLIkeDeslikeCommentCommand(likeCommentModel.likeStatus, id, userId))


    }
}
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpException, HttpStatus, Param, Put, Request, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../../../utilit/guards/jwt-auth-guards";
import { CommentPosts } from "../../posts/models/input/create-comments.input.model";
import { DeleteCommentCommand } from "../application/use-case/delete-use-case";
import { UpdateCommentCommand } from "../application/use-case/update-use-case";
import { UpdateLIkeDeslikeCommentCommand } from "../application/use-case/updateLileOnComment-use-case";
import { CommentsQueryRepository } from "../infrastructure/comments-query-repository";
import { CommentsQuerySqlRepository } from "../infrastructure/comments.sql.query.repository";
import { PutLikeComment } from "../models/input/put-like-comments.input.mode;";







@Controller('comments')
export class CommentsController {
    constructor(protected commentsQueryRepository: CommentsQueryRepository, protected jwtService: JwtService, private commandBuse: CommandBus, protected commentsQuerySqlRepository: CommentsQuerySqlRepository) { }


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

        const userId = payload ? payload.userId : null

        const comment = await this.commentsQuerySqlRepository.getCommentById(id, userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);
        }

        return comment


    }

    @Put("/:id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async updateComment(@Param("id") id: string, @Body() commetModel: CommentPosts, @Request() req,) {
        debugger



        const res = await this.commentsQuerySqlRepository.complianceCheckUserComment(id, req.user.userId)


        //@ts-ignore
        if (res.error === 'Forbidden') {
            throw new ForbiddenException();
        }


        const comment = await this.commentsQuerySqlRepository.getCommentById(id, req.user.userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);


        }



        await this.commandBuse.execute(new UpdateCommentCommand(commetModel.content, id))


    }

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async deleteCommentById(@Param("id") id: string, @Request() req) {
        debugger


        const res = await this.commentsQuerySqlRepository.complianceCheckUserComment(id, req.user.userId)


        if (res.error === 'Forbidden') {
            throw new ForbiddenException();
        }




        const comment = await this.commentsQuerySqlRepository.getCommentById(id, req.user.userId)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);

        }




        await this.commandBuse.execute(new DeleteCommentCommand(id))



    }


    @Put("/:id/like-status")
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    async commentLikeStatus(@Param("id") id: string, @Body() likeCommentModel: PutLikeComment, @Request() req,) {

        const comment = await this.commentsQuerySqlRepository.findComment(id)

        if (!comment) {
            throw new HttpException('comment not found', HttpStatus.NOT_FOUND);


        }


        //@ts-ignore
        await this.commandBuse.execute(new UpdateLIkeDeslikeCommentCommand(likeCommentModel.likeStatus, id, req.user.userId, comment.user_login))


    }
}
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { EmailAdapter } from "src/features/auth/application/emai-Adapter";
import { Comments } from "../../domain/comments.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentsRepository } from "../../infrastructure/comments-repository";


export class UpdateCommentCommand {
    constructor(
        public content: string,
        public id: string


    ) { }
}

@CommandHandler(UpdateCommentCommand)
export class updateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
    constructor(protected commentsRepository:CommentsRepository,) { }

    async execute(dtoInputDate: UpdateCommentCommand) {
        await this.commentsRepository.updateComment(dtoInputDate)

    }
}

import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { EmailAdapter } from "src/features/auth/application/emai-Adapter";
import { Comments } from "../../domain/comments.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentsRepository } from "../../infrastructure/comments-repository";


export class DeleteCommentCommand {
    constructor(
        public id: string


    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteeCommentrUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(protected commentsRepository: CommentsRepository) { }

    async execute(dtoInputDate: DeleteCommentCommand) {
        await this.commentsRepository.deleteCommetn(dtoInputDate.id);


    }
}

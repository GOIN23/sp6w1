import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { CommentsRepository } from "../../infrastructure/comments-repository";
import { CommentsSqlRepository } from "../../infrastructure/comments-sql-repository";


export class UpdateCommentCommand {
    constructor(
        public content: string,
        public id: string


    ) { }
}

@CommandHandler(UpdateCommentCommand)
export class updateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
    constructor(protected commentsRepository: CommentsRepository, protected commentsSqlRepository: CommentsSqlRepository) { }

    async execute(dtoInputDate: UpdateCommentCommand) {
        await this.commentsSqlRepository.updateComment(dtoInputDate)

    }
}

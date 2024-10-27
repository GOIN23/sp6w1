import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructure/comments-repository";
import { CommentsSqlRepository } from "../../infrastructure/comments-sql-repository";
;


export class DeleteCommentCommand {
    constructor(
        public id: string


    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteeCommentrUseCase implements ICommandHandler<DeleteCommentCommand> {
    constructor(protected commentsRepository: CommentsRepository, protected commentsSqlRepository: CommentsSqlRepository) { }

    async execute(dtoInputDate: DeleteCommentCommand) {
        await this.commentsSqlRepository.deleteCommetn(dtoInputDate.id);


    }
}

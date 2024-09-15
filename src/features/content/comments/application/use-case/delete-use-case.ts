import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";;
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

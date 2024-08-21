import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

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

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructure/comments-repository";
import { statusCommentLike } from "../../type/typeCommen";


export class UpdateLIkeDeslikeCommentCommand {
    constructor(
        public likeStatus: statusCommentLike,
        public commentId: string,
        public userId: string

    ) { }
}

@CommandHandler(UpdateLIkeDeslikeCommentCommand)
export class UpdateLikeDislikeOnCommentUseCase implements ICommandHandler<UpdateLIkeDeslikeCommentCommand> {
    constructor(protected commentsRepository: CommentsRepository,) { }

    async execute(dtoInputDate: UpdateLIkeDeslikeCommentCommand) {
        const fintLikeDislake = await this.commentsRepository.findLikeDislakeComment(dtoInputDate.userId, dtoInputDate.commentId);

        if (!fintLikeDislake) {
            const likeInfoMetaData: any = {
                commentId: dtoInputDate.commentId,
                createdAt: new Date().toISOString(),
                status: dtoInputDate.likeStatus,
                userID: dtoInputDate.userId,
            };

            await this.commentsRepository.creatLikesDislek(likeInfoMetaData);
            return;
        }

        await this.commentsRepository.updateLikeStatusInComment(dtoInputDate.userId, dtoInputDate.likeStatus, dtoInputDate.commentId);

    }
}

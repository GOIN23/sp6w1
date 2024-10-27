import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructure/comments-repository";
import { CommentsSqlRepository } from "../../infrastructure/comments-sql-repository";
import { statusCommentLike } from "../../type/typeCommen";


export class UpdateLIkeDeslikeCommentCommand {
    constructor(
        public likeStatus: statusCommentLike,
        public commentId: string,
        public userId: string,
        public userLogin: string

    ) { }
}

@CommandHandler(UpdateLIkeDeslikeCommentCommand)
export class UpdateLikeDislikeOnCommentUseCase implements ICommandHandler<UpdateLIkeDeslikeCommentCommand> {
    constructor(protected commentsRepository: CommentsRepository, protected commentsSqlRepository: CommentsSqlRepository) { }

    async execute(dtoInputDate: UpdateLIkeDeslikeCommentCommand) {
        const fintLikeDislake = await this.commentsSqlRepository.findLikeDislakeComment(dtoInputDate.userId, dtoInputDate.commentId);

        if (!fintLikeDislake) {
            const likeInfoMetaData: any = {
                commentId: dtoInputDate.commentId,
                createdAt: new Date().toISOString(),
                status: dtoInputDate.likeStatus,
                userID: dtoInputDate.userId,
                userLogin: dtoInputDate.userLogin
            };

            await this.commentsSqlRepository.creatLikesDislek(likeInfoMetaData);
            return;
        }

        await this.commentsSqlRepository.updateLikeStatusInComment(dtoInputDate.userId, dtoInputDate.likeStatus, dtoInputDate.commentId);

    }
}

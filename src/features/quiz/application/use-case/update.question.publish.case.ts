import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";


export class UpdateQuestionPublishedCommand {
    constructor(
        public published: boolean,
        public questionId: string


    ) { }
}

@CommandHandler(UpdateQuestionPublishedCommand)
export class updateeQuestionPublishCase implements ICommandHandler<UpdateQuestionPublishedCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: UpdateQuestionPublishedCommand) {

        await this.quizrepository.updateQuestionPublish(input.published, input.questionId)

    }
}
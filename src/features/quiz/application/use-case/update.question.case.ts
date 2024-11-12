import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";
import { inputQuestionsUpdateT } from "../../type/quizType";


export class UpdateQuestionCommand {
    constructor(
        public body: string,
        public correctAnswers: string[],
        public questionId: string

    ) { }
}

@CommandHandler(UpdateQuestionCommand)
export class updateeQuestionCase implements ICommandHandler<UpdateQuestionCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: UpdateQuestionCommand) {

        const questionUpdate: inputQuestionsUpdateT = {
            body: input.body,
            correctAnswers: input.correctAnswers,
            updatedAt: new Date().toISOString()

        }

        await this.quizrepository.updateQuestion(questionUpdate, input.questionId)

    }
}

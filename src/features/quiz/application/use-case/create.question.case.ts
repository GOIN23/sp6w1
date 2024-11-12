import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";


export class CreateQuestionCommand {
    constructor(
        public body: string,
        public correctAnswers: string[]

    ) { }
}

@CommandHandler(CreateQuestionCommand)
export class createQuestionCase implements ICommandHandler<CreateQuestionCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: CreateQuestionCommand) {

        const question = {
            body: input.body,
            correctAnswers: input.correctAnswers,
            published: false,
            createdAt: new Date().toISOString()
        }



        return await this.quizrepository.createQuestion(question)
    }
}

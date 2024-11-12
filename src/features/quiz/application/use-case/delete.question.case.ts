import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";


export class DeleteQuestionCommand {
    constructor(
        public id: string,

    ) { }
}

@CommandHandler(DeleteQuestionCommand)
export class deleteQuestionCase implements ICommandHandler<DeleteQuestionCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(deleteQuestionCommand: DeleteQuestionCommand) {

        await this.quizrepository.deleteQuestion(deleteQuestionCommand.id)


    }
}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";


export class CreatePairCommand {
    constructor(
        public userId: string


    ) { }
}

@CommandHandler(CreatePairCommand)
export class createPairCase implements ICommandHandler<CreatePairCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: CreatePairCommand) {





    }
}

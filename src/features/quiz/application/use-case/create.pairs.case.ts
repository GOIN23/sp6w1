import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";
import { playerstatus, statusQuiz } from "../../type/quizType";


export class CreatePairCommand {
    constructor(
        public userId: string,
    ) { }
}

@CommandHandler(CreatePairCommand)
export class createPairCase implements ICommandHandler<CreatePairCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: CreatePairCommand) {
        const player = {
            userId: input.userId,
            score: 0,
            status: playerstatus.draft,
        }

        const pair = {
            pairCreatedDate: new Date().toISOString(),
            status: statusQuiz.PendingSecondPlayer,
        }

        return await this.quizrepository.createPair(player, pair)


    }
}

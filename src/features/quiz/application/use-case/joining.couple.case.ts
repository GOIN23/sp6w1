import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";


export class JoiningCoupleCommand {
    constructor(
        public userId: string,
        public gameId: string


    ) { }
}

@CommandHandler(JoiningCoupleCommand)
export class JoiningCoupleCase implements ICommandHandler<JoiningCoupleCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: JoiningCoupleCommand) {

        const inputJoiningCouple = {
            userId: input.userId,
            startGameDate: new Date().toISOString(),
            gameId: input.gameId
        }

        await this.quizrepository.joiningCouple(inputJoiningCouple)


    }
}
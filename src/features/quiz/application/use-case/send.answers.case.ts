import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Quizrepository } from "../../infrastructure/quiz.repository";

export class SendAnswersCommand {

    constructor(
        public gameId: string,
        public playerId: string,
        public correctAnswers: any,
        public score: string,
        public playerTwoId: string,

    ) { }
}

@CommandHandler(SendAnswersCommand)
export class SendAnswersCase implements ICommandHandler<SendAnswersCommand> {
    constructor(protected quizrepository: Quizrepository) { }

    async execute(input: SendAnswersCommand) {


        const inputSendAnswers = {
            gameId: input.gameId,
            currentPlayerId: input.playerId,
            createdAt: new Date().toISOString(),
            correctAnswers: input.correctAnswers.answer,
            score: input.score,
            playerTwoId: input.playerTwoId
        }

        return await this.quizrepository.sendAnswer(inputSendAnswers)

    }
}
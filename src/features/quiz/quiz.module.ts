import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './application/quiz.service';
import { createPairCase } from './application/use-case/create.pairs.case';
import { createQuestionCase } from './application/use-case/create.question.case';
import { deleteQuestionCase } from './application/use-case/delete.question.case';
import { JoiningCoupleCase } from './application/use-case/joining.couple.case';
import { SendAnswersCase } from './application/use-case/send.answers.case';
import { updateeQuestionCase } from './application/use-case/update.question.case';
import { updateeQuestionPublishCase } from './application/use-case/update.question.publish.case';
import { AnswersEntity } from './domain/answers.entityT';
import { GamesEntity } from './domain/game.entityT';
import { GamesQuestionEntity } from './domain/game.questions.entityT';
import { PlayersEntity } from './domain/player.entityT';
import { QuestionsEntity } from './domain/questions.entityT';
import { QuizQueryrepository } from './infrastructure/quiz.query.repository';
import { Quizrepository } from './infrastructure/quiz.repository';
import { QuizController } from './quiz.controller';
import { QuizQuestionsController } from './quiz.controller.questions';


const questionsProviders: Provider[] = [QuizService, QuizQueryrepository, Quizrepository]
export const questionsCase: Provider[] = [createPairCase, createQuestionCase, deleteQuestionCase, updateeQuestionCase, updateeQuestionPublishCase, JoiningCoupleCase, SendAnswersCase]




@Module({
    imports: [
        TypeOrmModule.forFeature([QuestionsEntity, GamesEntity, GamesQuestionEntity, PlayersEntity, AnswersEntity]),
    ],
    controllers: [QuizQuestionsController, QuizController],
    providers: [...questionsProviders, ...questionsCase],
    exports: []
})
export class QuestionModule { }
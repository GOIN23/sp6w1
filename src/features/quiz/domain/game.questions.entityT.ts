import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GamesEntity } from './game.entityT';
import { QuestionsEntity } from './questions.entityT';




@Entity({ name: 'gameQuestion' })
export class GamesQuestionEntity {
    @PrimaryGeneratedColumn()
    gameQuestionId: number;

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.questions) // Указываем обратную связь
    @JoinColumn({ name: "gameId" })
    game: GamesEntity

    @ManyToOne(() => QuestionsEntity, (questionsEntity) => questionsEntity.gamesQuestionEntity) // Указываем обратную связь
    @JoinColumn({ name: "questionId" })
    question: QuestionsEntity


}

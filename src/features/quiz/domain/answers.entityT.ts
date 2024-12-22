import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlayersEntity } from './player.entityT';
import { QuestionsEntity } from './questions.entityT';




@Entity({ name: 'answer' })
export class AnswersEntity {
    @PrimaryGeneratedColumn()
    answerId: number;

    @ManyToOne(() => PlayersEntity, (playersEntity) => playersEntity.answers)
    @JoinColumn({ name: 'playerId' })
    playerId: PlayersEntity

    @Column()
    createdAt: string;

    @Column()
    status: 'Correct' | 'Incorrect'

    @ManyToOne(() => QuestionsEntity, (questionsEntity) => questionsEntity.answers)
    @JoinColumn({ name: 'questionId' })
    question: QuestionsEntity

    @Column()
    body: string
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnswersEntity } from './answers.entityT';
import { GamesQuestionEntity } from './game.questions.entityT';




@Entity({ name: 'questions' })
export class QuestionsEntity {
    @PrimaryGeneratedColumn()
    questionsId: number;

    @Column()
    body: string

    @Column({ type: 'text', array: true })
    correctAnswers: string[]

    @Column()
    published: boolean

    @Column()
    createdAt: string

    @Column({ nullable: true })
    updatedAt: string | null

    @OneToMany(() => GamesQuestionEntity, (gamesQuestionEntity) => gamesQuestionEntity.question)
    gamesQuestionEntity: GamesQuestionEntity

    @OneToMany(() => AnswersEntity, (answersEntity) => answersEntity.question)
    answers: AnswersEntity[]





}

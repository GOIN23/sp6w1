import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { statusQuiz } from '../type/quizType';
import { GamesQuestionEntity } from './game.questions.entityT';
import { PlayersEntity } from './player.entityT';




@Entity({ name: 'game' })
export class GamesEntity {
    @PrimaryGeneratedColumn()
    gameId: number;

    @OneToOne(() => PlayersEntity, (playersEntity) => playersEntity.playerId) // Указываем обратную связь
    @JoinColumn({ name: 'playerOneId' })
    playerOneId: PlayersEntity

    @OneToOne(() => PlayersEntity, (playersEntity) => playersEntity.playerId, {
        nullable: true, // Связь может быть null
    }) // Указываем обратную связь
    @JoinColumn({ name: 'playerTwoId' })
    playerTwoId: PlayersEntity

    @OneToMany(() => GamesQuestionEntity, (gamesQuestionEntity) => gamesQuestionEntity.game)
    @JoinColumn()
    questions: GamesQuestionEntity[]

    @Column()
    status: statusQuiz

    @Column()
    pairCreatedDate: string

    @Column({
        nullable: true, // Связь может быть null

    })
    startGameDate: string

    @Column({
        nullable: true, // Связь может быть null

    })
    finishGameDate: string
}

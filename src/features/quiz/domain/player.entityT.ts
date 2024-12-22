import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEnity } from '../../user/domain/entity.user.entityT';
import { playerstatus } from '../type/quizType';
import { AnswersEntity } from './answers.entityT';




@Entity({ name: 'player' })
export class PlayersEntity {
    @PrimaryGeneratedColumn()
    playerId: number;

    @Column()
    score: number;

    @Column()
    status: playerstatus

    @ManyToOne(() => UserEnity, (userEnity) => userEnity)
    @JoinColumn({ name: 'userFkId' })
    users: UserEnity;

    // @OneToOne(() => GamesEntity, (gamesEntity) => gamesEntity.playerOneId)
    // gameOne: GamesEntity;

    // @OneToOne(() => GamesEntity, (gamesEntity) => gamesEntity.playerTwoId)
    // gameTwo: GamesEntity;


    @OneToMany(() => AnswersEntity, (answersEntity) => answersEntity.playerId)
    @JoinColumn({ name: 'answers' })
    answers: AnswersEntity[]


}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEnity } from '../../../user/domain/entity.user.entityT';
import { CommentsEntityT } from './comments.entityT';



@Entity({ name: "likesCommentsInfo" })
export class LikesInfoCommentsEntityT {
    @PrimaryGeneratedColumn()
    likesInfoCommentsId: number;

    @Column()
    status: string;

    @Column()
    createdAt: string

    @ManyToOne(() => CommentsEntityT, (commentsEntityT) => commentsEntityT.likesInfoCommentsEntityT, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'commentsId' })
    comments: CommentsEntityT;

    @ManyToOne(() => UserEnity, (userEnity) => userEnity.likesInfoCommentsEntityT)
    @JoinColumn({ name: 'userFkId' })
    users: UserEnity;
}

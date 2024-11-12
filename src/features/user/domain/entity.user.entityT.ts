import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SesionEntity } from '../../auth/domain/sesion.auth.entityT';
import { CommentsEntityT } from '../../content/comments/domain/comments.entityT';
import { LikesInfoCommentsEntityT } from '../../content/comments/domain/likes.comments.entityT';
import { LikesInfoPostsEntityT } from '../../content/posts/domain/likes.posts.entityT';
import { EmailConfirmation } from './email.confirmation.entityT';




@Entity({ name: 'users' })
export class UserEnity {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    login: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    passwordSalt: string;

    @Column()
    createdAt: string;

    @OneToOne(() => EmailConfirmation, (emailConfirmation) => emailConfirmation.user, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    emailConfirmation: EmailConfirmation;

    @OneToMany(() => SesionEntity, (SesionEntity) => SesionEntity.user) // Указываем обратную связь
    @JoinColumn()
    sessions: SesionEntity[];


    @OneToMany(() => CommentsEntityT, (commentsEntityT) => commentsEntityT.users)
    comments: CommentsEntityT

    @OneToMany(() => LikesInfoCommentsEntityT, (likesInfoCommentsEntityT) => likesInfoCommentsEntityT.users)
    likesInfoCommentsEntityT: LikesInfoCommentsEntityT

    @OneToMany(() => LikesInfoPostsEntityT, (likesInfoPostsEntityT) => likesInfoPostsEntityT.users)
    likesInfoPostsEntityT: LikesInfoPostsEntityT




}

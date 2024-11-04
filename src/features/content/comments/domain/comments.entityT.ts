import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEnity } from '../../../user/domain/entity.user';
import { PostsEntityT } from '../../posts/domain/posts.entityT';
import { LikesInfoCommentsEntityT } from './likes.comments.entityT';




@Entity({ name: "comments" })
export class CommentsEntityT {
    @PrimaryGeneratedColumn()
    commentsId: number;

    @Column()
    content: string;


    @Column()
    createdAt: string

    @ManyToOne(() => PostsEntityT, (postsEntityT) => postsEntityT.comments, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'postFkId' })
    posts: PostsEntityT;

    @ManyToOne(() => UserEnity, (userEnity) => userEnity.comments)
    @JoinColumn({ name: 'userFkId' })
    users: UserEnity;


    @OneToMany(() => LikesInfoCommentsEntityT, (likesInfoCommentsEntityT) => likesInfoCommentsEntityT.comments)
    @JoinColumn()
    likesInfoCommentsEntityT: LikesInfoCommentsEntityT[]


}

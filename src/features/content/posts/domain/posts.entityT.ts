import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogsEntityT } from '../../blogs/domain/blog.entityT';
import { CommentsEntityT } from '../../comments/domain/comments.entityT';
import { LikesInfoPostsEntityT } from './likes.posts.entityT';








@Entity({ name: 'posts' })
export class PostsEntityT {
    @PrimaryGeneratedColumn()
    postId: number;

    @Column()
    shortDescription: string;

    @Column()
    content: string;

    @Column()
    blogName: string

    @Column()
    createdAt: string

    @Column()
    title: string;

    @ManyToOne(() => BlogsEntityT, (blogsEntityT) => blogsEntityT.posts, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'blogIdFk' })
    blogs: BlogsEntityT;

    @OneToMany(() => CommentsEntityT, (commentsEntityT) => commentsEntityT.posts, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    comments: CommentsEntityT[]

    @OneToMany(() => LikesInfoPostsEntityT, (likesInfoPostsEntityT) => likesInfoPostsEntityT.posts, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    likesInfoPostsEntityT: LikesInfoPostsEntityT[]


}

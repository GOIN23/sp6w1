import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntityT } from '../../posts/domain/posts.entityT';




@Entity({ name: 'blogs' })
export class BlogsEntityT {
    @PrimaryGeneratedColumn()
    blogId: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    websiteUrl: string;

    @Column()
    createdAt: string

    @Column()
    isMembership: boolean

    @OneToMany(() => PostsEntityT, (postsEntityT) => postsEntityT.blogs, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'postFkId' })
    posts: PostsEntityT[];


}

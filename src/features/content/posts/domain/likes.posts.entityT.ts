import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEnity } from "../../../user/domain/entity.user.entityT";
import { PostsEntityT } from "./posts.entityT";

@Entity({ name: "likesPostsInfo" })
export class LikesInfoPostsEntityT {
    @PrimaryGeneratedColumn()
    likesInfoPostssId: number;

    @Column()
    status: string;

    @Column()
    createdAt: string

    @ManyToOne(() => PostsEntityT, (postsEntityT) => postsEntityT.likesInfoPostsEntityT, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'postsId' })
    posts: PostsEntityT;

    @ManyToOne(() => UserEnity, (userEnity) => userEnity.likesInfoPostsEntityT)
    @JoinColumn({ name: 'userFkId' })
    users: UserEnity;
}
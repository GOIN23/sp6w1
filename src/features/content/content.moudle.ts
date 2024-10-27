import { Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NameIsExistConstraint } from "../../utilit/decorators/transform/blogFind";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { BlogsControllerGet } from "./blog.contr.get";
import { BlogService } from "./blogs/application/blog.service";
import { BlogsController } from "./blogs/blog.controller";
import { Blog, BlogSchema } from "./blogs/domain/blog.entity";
import { BlogsQueryRepository } from "./blogs/infrastructure/blogs.query-repository";
import { BlogsSqlQueryRepository } from "./blogs/infrastructure/blogs.query.sql-repository";
import { BlogRepository } from "./blogs/infrastructure/blogs.repository";
import { BlogSqlRepository } from "./blogs/infrastructure/blogs.sql.repository";
import { CommentsController } from "./comments/api/comments-controller";
import { CommentsService } from "./comments/application/commets.service";
import { DeleteeCommentrUseCase } from "./comments/application/use-case/delete-use-case";
import { updateCommentUseCase } from "./comments/application/use-case/update-use-case";
import { UpdateLikeDislikeOnCommentUseCase } from "./comments/application/use-case/updateLileOnComment-use-case";
import { Comments, CommentSchema } from "./comments/domain/comments.entity";
import { LikesCommentsInfo, LikesCommentsSchema } from "./comments/domain/likes.entity";
import { CommentsQueryRepository } from "./comments/infrastructure/comments-query-repository";
import { CommentsRepository } from "./comments/infrastructure/comments-repository";
import { CommentsSqlRepository } from "./comments/infrastructure/comments-sql-repository";
import { CommentsQuerySqlRepository } from "./comments/infrastructure/comments.sql.query.repository";
import { PostsService } from "./posts/application/posts.service";
import { LikesPostInfo, LLikesPostInfoSchema } from "./posts/domain/likes-posts.entity";
import { Posts, PostSchema } from "./posts/domain/posts.entity";
import { PostsQueryRepository } from "./posts/infrastructure/posts.query-repository";
import { PostsQuerySqlRepository } from "./posts/infrastructure/posts.query.sql-repository";
import { PostRepository } from "./posts/infrastructure/posts.repository";
import { PostSqlRepository } from "./posts/infrastructure/posts.sql.repository";
import { PostsController } from "./posts/posts.controller";



const blogsProvides: Provider[] = [BlogService, BlogRepository, BlogsQueryRepository, NameIsExistConstraint, BlogsSqlQueryRepository, BlogSqlRepository]


const postsProvedis: Provider[] = [PostsService, PostsQueryRepository, PostRepository, PostSqlRepository, PostsQuerySqlRepository]
const commentsProvides: Provider[] = [CommentsService, CommentsQueryRepository, CommentsRepository, CommentsQuerySqlRepository, CommentsSqlRepository]
const useCaseComment: Provider[] = [DeleteeCommentrUseCase, updateCommentUseCase, UpdateLikeDislikeOnCommentUseCase]


@Module({
    imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }, { name: Posts.name, schema: PostSchema }, { name: LikesCommentsInfo.name, schema: LikesCommentsSchema }, { name: LikesPostInfo.name, schema: LLikesPostInfoSchema }, { name: Comments.name, schema: CommentSchema }]), AuthModule, UserModule],
    controllers: [BlogsController, PostsController, CommentsController, BlogsControllerGet],
    providers: [...blogsProvides, ...postsProvedis, ...commentsProvides, ...useCaseComment],

})
export class ContentModule {

}






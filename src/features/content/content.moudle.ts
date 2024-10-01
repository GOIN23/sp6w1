import { Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BlogService } from "./blogs/application/blog.service";
import { BlogRepository } from "./blogs/infrastructure/blogs.repository";
import { BlogsQueryRepository } from "./blogs/infrastructure/blogs.query-repository";
import { BlogsController } from "./blogs/blog.controller";
import { Blog, BlogSchema } from "./blogs/domain/blog.entity";
import { PostsService } from "./posts/application/posts.service";
import { PostsQueryRepository } from "./posts/infrastructure/posts.query-repository";
import { PostRepository } from "./posts/infrastructure/posts.repository";
import { CommentsService } from "./comments/application/commets.service";
import { CommentsQueryRepository } from "./comments/infrastructure/comments-query-repository";
import { CommentsRepository } from "./comments/infrastructure/comments-repository";
import { DeleteeCommentrUseCase } from "./comments/application/use-case/delete-use-case";
import { updateCommentUseCase } from "./comments/application/use-case/update-use-case";
import { UpdateLikeDislikeOnCommentUseCase } from "./comments/application/use-case/updateLileOnComment-use-case";
import { PostsController } from "./posts/posts.controller";
import { CommentsController } from "./comments/api/comments-controller";
import { Posts, PostSchema } from "./posts/domain/posts.entity";
import { Comments, CommentSchema } from "./comments/domain/comments.entity";
import { LikesCommentsInfo, LikesCommentsSchema } from "./comments/domain/likes.entity";
import { LikesPostInfo, LLikesPostInfoSchema } from "./posts/domain/likes-posts.entity";
import { RefreshGuard } from "src/utilit/guards/refresh-auth-guard";
import { AuthModule } from "../auth/auth.module";
import { CqrsModule } from "@nestjs/cqrs";
import { UtilitModule } from "src/utilit/utitli.module";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { NameIsExistConstraint } from "src/utilit/decorators/transform/blogFind";
import { BlogsSqlQueryRepository } from "./blogs/infrastructure/blogs.query.sql-repository";
import { BlogSqlRepository } from "./blogs/infrastructure/blogs.sql.repository";
import { PostSqlRepository } from "./posts/infrastructure/posts.sql.repository";
import { PostsQuerySqlRepository } from "./posts/infrastructure/posts.query.sql-repository";
import { BlogsControllerGet } from "./blog.contr.get";



const blogsProvides: Provider[] = [BlogService, BlogRepository, BlogsQueryRepository, NameIsExistConstraint, BlogsSqlQueryRepository, BlogSqlRepository]


const postsProvedis: Provider[] = [PostsService, PostsQueryRepository, PostRepository, PostSqlRepository, PostsQuerySqlRepository]
const commentsProvides: Provider[] = [CommentsService, CommentsQueryRepository, CommentsRepository]
const useCaseComment: Provider[] = [DeleteeCommentrUseCase, updateCommentUseCase, UpdateLikeDislikeOnCommentUseCase]


@Module({
    imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }, { name: Posts.name, schema: PostSchema }, { name: LikesCommentsInfo.name, schema: LikesCommentsSchema }, { name: LikesPostInfo.name, schema: LLikesPostInfoSchema }, { name: Comments.name, schema: CommentSchema }]), AuthModule, CqrsModule, UtilitModule, JwtModule, UserModule],
    controllers: [BlogsController, PostsController, CommentsController, BlogsControllerGet],
    providers: [...blogsProvides, ...postsProvedis, ...commentsProvides, ...useCaseComment],

})
export class ContentModule {

}






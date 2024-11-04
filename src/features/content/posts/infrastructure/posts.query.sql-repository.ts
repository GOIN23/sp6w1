import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { LikesInfoPostsEntityT } from "../domain/likes.posts.entityT";
import { PostsEntityT } from "../domain/posts.entityT";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { PostViewModelLiKeArray, statusCommentLike } from "../type/typePosts";

@Injectable()
export class PostsQuerySqlRepository {
    constructor(protected dataSource: DataSource,
        @InjectRepository(PostsEntityT) protected posts: Repository<PostsEntityT>,
        @InjectRepository(LikesInfoPostsEntityT) protected likesInfoPosts: Repository<LikesInfoPostsEntityT>

    ) {
    }

    async getById(postId: string, userId?: string) {
        debugger
        try {
            const post = await this.posts.findOne({
                where: { postId: +postId },
                relations: ['blogs']
            })






            let status: statusCommentLike;

            if (userId === null) {
                status = statusCommentLike.None;
            } else {
                const qureLikesInfoComments = await this.likesInfoPosts
                    .createQueryBuilder('l')
                    .where('l.postsId = :postId', { postId })
                    .andWhere('l.userFkId = :userId', { userId })
                    .getMany()

                status = (qureLikesInfoComments[0].status as statusCommentLike) || statusCommentLike.None
            }




            // const qureCountLikeDislike = await this.likesInfoPosts
            //     .createQueryBuilder('l')
            //     .select('COUNT(*)', 'countDislike')
            //     .addSelect(
            //         (subQuery) => {
            //             return subQuery.select("COUNT(*)")
            //                 .from(LikesInfoPostsEntityT, "likes")
            //                 .where("likes.status = 'Like'")
            //                 .andWhere("likes.postsId = :postId", { postId })
            //         },
            //         'countLike'
            //     )
            //     .where("l.status = 'Dislike'")
            //     .andWhere("l.postsId = :postId", { postId })
            //     .getRawOne();

            const qureCountLikeDislike = await this.likesInfoPosts
                .createQueryBuilder('l')
                .select('COUNT(*)', 'countDislike')
                .addSelect(
                    (subQuery) => {
                        return subQuery.select("COUNT(*)")
                            .from(LikesInfoPostsEntityT, "likes")
                            .where("likes.status = 'Like'")
                            .andWhere("likes.postsId = :postId", { postId });
                    },
                    'countLike'
                )
                .addSelect(
                    (subQuery) => {
                        return subQuery
                            .select("array_agg(likes.userFkId) AS lastThreeLikes")
                            .from(LikesInfoPostsEntityT, "likes")
                            .where("likes.status = 'Like'")
                            .andWhere("likes.postsId = :postId", { postId })
                            .orderBy("likes.createdAt", "DESC") // сортировка по убыванию даты
                            .limit(3); // лимитируем до трех последних лайков
                    },
                    'lastThreeLikes'
                )
                .where("l.status = 'Dislike'")
                .andWhere("l.postsId = :postId", { postId })
                .getRawOne();





            return {
                id: post.postId.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogs.blogId.toString(),
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    dislikesCount: +qureCountLikeDislike.countDislike,
                    likesCount: +qureCountLikeDislike.countLike,
                    myStatus: status,
                    newestLikes: [...qureCountLikeDislike]
                }

            }

        } catch (e) {

            console.log(e)
        }


    }


    async getPosts(query: QueryPostsParamsDto, userId?: string): Promise<any | { error: string }> {
        const sortBy = query.sortBy || 'createdAt'; // Сортировка по умолчанию — по createdAt
        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchTitleTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;
        const pageNumber = query.pageNumber || 1;
        const pageSize = query.pageSize || 10;

        // Получаем репозиторий для работы с таблицей posts

        try {
            debugger
            const [result, totalCount] = await this.posts
                .createQueryBuilder('p')
                .select('p.postId') // Берем только ID основной сущности
                .where(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .skip((query.pageNumber - 1) * query.pageSize)
                .take(query.pageSize)
                .getManyAndCount();

            const postIds = result.map(post => post.postId);

            // Второй запрос: подгружаем данные и связанные сущности
            const [items, s] = await this.posts
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogs', 'b')
                .where('p.postId IN (:...postIds)', { postIds })
                .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .getManyAndCount();








            // Форматируем данные под ожидаемую структуру
            const mapPosts: any[] = items.map((post) => ({
                id: post.postId.toString(),
                blogId: post.blogs.blogId.toString(),
                blogName: post.blogName, // Предполагаем, что blogName приходит из связи с таблицей blog
                content: post.content,
                createdAt: post.createdAt,
                shortDescription: post.shortDescription,
                title: post.title,
                extendedLikesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: 'None',
                    newestLikes: []
                }
            }));

            // Возвращаем данные в формате с метаинформацией
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: +pageNumber,
                pageSize: +pageSize,
                totalCount: +totalCount,
                items: mapPosts,
            };
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw new Error('Failed to fetch posts');
        }







    }


    async mapPosts(items: any, userId?: string): Promise<PostViewModelLiKeArray[]> {




        const promises = items.map(async (post) => {
            const qureCount = `
        SELECT count(*) as count_dislike, (SELECT count(*) as count_like from likes_info_posts WHERE likes_info_posts.status = 'Like' AND post_fk_id = $1)
        FROM likes_info_posts p
        WHERE p.status = 'Dislike' AND p.post_fk_id = $1
        `
            const parameter = [post.post_id]

            const countLike = await this.dataSource.query(qureCount, parameter)



            let userStatus: any[] = []
            if (userId) {
                const userLike = `
                SELECT *
                FROM likes_info_posts
                WHERE user_fk_id = $1 AND post_fk_id = $2
                `
                const parametrUserLike = [userId, post.post_id]

                const res = await this.dataSource.query(userLike, parametrUserLike)
                userStatus.push(res[0])

            }


            // const countLikeUser = `
            // SELECT *
            // FROM likes_info_posts i
            // WHERE post_fk_id = $1 AND i.status = 'Like'
            // `
            // const parametrCountLikeUser = [post.post_id]


            const countLikeUserQuery = `
            SELECT *
            FROM likes_info_posts i
            WHERE post_fk_id = $1 AND i.status = 'Like'
            ORDER BY i.created_at_inf DESC -- Сортируем по дате, чтобы получить последние лайки
            LIMIT 3; -- Ограничиваем количество последних лайков
        `;
            const parametrCountLikeUser = [post.post_id]

            const resultCountLikeUser = await this.dataSource.query(countLikeUserQuery, parametrCountLikeUser)



            if (!resultCountLikeUser[0]) {

                return {
                    id: post.post_id.toString(),
                    title: post.title,
                    shortDescription: post.short_description,
                    content: post.content,
                    blogId: post.fk_blog.toString(),
                    blogName: post.blog_name,
                    createdAt: post.created_at,
                    extendedLikesInfo: {
                        likesCount: +countLike[0].count_like,
                        dislikesCount: +countLike[0].count_dislike,
                        myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                        newestLikes: []
                    }
                }
            }

            return {
                id: post.post_id.toString(),
                title: post.title,
                shortDescription: post.short_description,
                content: post.content,
                blogId: post.fk_blog.toString(),
                blogName: post.blog_name,
                createdAt: post.created_at,
                extendedLikesInfo: {
                    likesCount: +countLike[0].count_like,
                    dislikesCount: +countLike[0].count_dislike,
                    myStatus: !userStatus[0] ? 'None' : userStatus[0].status,
                    newestLikes: [...resultCountLikeUser.map(el => {
                        return {
                            addedAt: el.created_at_inf,
                            userId: el.user_fk_id.toString(),
                            login: el.user_login
                        }
                    })]
                }
            }

        })



        const userMapData = await Promise.all(promises)

        return userMapData;


    }


}

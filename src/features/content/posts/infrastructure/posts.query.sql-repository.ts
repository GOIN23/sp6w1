import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginatorT, ResultObject } from "../../../../utilit/TYPE/generalType";
import { LikesInfoPostsEntityT } from "../domain/likes.posts.entityT";
import { PostsEntityT } from "../domain/posts.entityT";
import { QueryPostsParamsDto } from "../models/input/query-posts.input";
import { postOutputT, PostViewModelLiKeArray, statusCommentLike } from "../type/typePosts";

@Injectable()
export class PostsQuerySqlRepository {
    constructor(protected dataSource: DataSource,
        @InjectRepository(PostsEntityT) protected posts: Repository<PostsEntityT>,
        @InjectRepository(LikesInfoPostsEntityT) protected likesInfoPosts: Repository<LikesInfoPostsEntityT>

    ) {
    }

    async getById(postId: string, userId?: string): Promise<ResultObject<postOutputT | null>> {

        try {
            const post = await this.posts.findOne({
                where: { postId: +postId },
                relations: ['blogs']
            })

            let status: statusCommentLike = statusCommentLike.None

            if (userId === null) {
                status = statusCommentLike.None;
            } else {
                const qureLikesInfoComments = await this.likesInfoPosts
                    .createQueryBuilder('l')
                    .where('l.postsId = :postId', { postId })
                    .andWhere('l.userFkId = :userId', { userId })
                    .getMany()

                try {
                    status = (qureLikesInfoComments[0].status as statusCommentLike) || statusCommentLike.None

                } catch (error) {
                    console.log(error)

                }
            }

            const qureCountLikeDislike = await this.likesInfoPosts
                .createQueryBuilder('l')
                .select('COUNT(*)', 'countDislike')
                .addSelect(
                    (subQuery) => {
                        return subQuery.select("COUNT(*)")
                            .from(LikesInfoPostsEntityT, "likes")
                            .where("likes.status = 'Like'")
                            .andWhere("likes.postsId = :postId", { postId })
                    },
                    'countLike'
                )
                .where("l.status = 'Dislike'")
                .andWhere("l.postsId = :postId", { postId })
                .getRawOne();


            const LatestThreeLikes = await this.likesInfoPosts
                .createQueryBuilder('likes')
                .leftJoinAndSelect('likes.users', 'u')
                .where("likes.status = 'Like'")
                .andWhere("likes.postsId = :postId", { postId })
                .orderBy("likes.createdAt", "DESC")
                .limit(3)
                .getMany()





            return {
                result: true,
                errorMessage: '',
                data: {
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
                        myStatus: status || statusCommentLike.None,
                        newestLikes: [...LatestThreeLikes.map(el => {
                            return {
                                addedAt: el.createdAt,
                                userId: el.users.userId.toString(),
                                login: el.users.login
                            }
                        })]
                    }

                }
            }



        } catch (e) {

            console.log(e)
            return {
                result: false,
                errorMessage: '',
                data: null
            }
        }


    }

    async getPosts(query: QueryPostsParamsDto, userId?: string): Promise<ResultObject<PaginatorT<postOutputT> | null>> {
        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchTitleTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;
        const pageNumber = query.pageNumber || 1;
        const pageSize = query.pageSize || 10;

        // Получаем репозиторий для работы с таблицей posts

        try {
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
            const items = await this.posts
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogs', 'b')
                .where('p.postId IN (:...postIds)', { postIds })
                .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .getMany()







            const mapPosts = await this.mapPosts(items, userId)

            // Возвращаем данные в формате с метаинформацией
            return {
                result: true,
                errorMessage: '',
                data: {
                    pagesCount: Math.ceil(totalCount / pageSize),
                    page: +pageNumber,
                    pageSize: +pageSize,
                    totalCount: +totalCount,
                    items: mapPosts,
                }
            };
        } catch (error) {
            console.error('Error fetching posts:', error);

            return {
                result: false,
                errorMessage: 'Error fetching posts',
                data: null
            }
        }
    }

    async mapPosts(items: any, userId?: string): Promise<PostViewModelLiKeArray[]> {
        const promises = items.map(async (post: PostsEntityT) => {
            try {
                let status: statusCommentLike

                if (userId === null) {
                    status = statusCommentLike.None;
                } else {
                    const qureLikesInfoComments = await this.likesInfoPosts
                        .createQueryBuilder('l')
                        .where('l.postsId = :postId', { postId: post.postId })
                        .andWhere('l.userFkId = :userId', { userId })
                        .getMany()


                    try {
                        //@ts-ignore
                        status = qureLikesInfoComments[0].status || statusCommentLike.None

                    } catch (error) {
                        console.log(error, 'errorerrorerrorerror')

                    }
                }

                const qureCountLikeDislike = await this.likesInfoPosts
                    .createQueryBuilder('l')
                    .select('COUNT(*)', 'countDislike')
                    .addSelect(
                        (subQuery) => {
                            return subQuery.select("COUNT(*)")
                                .from(LikesInfoPostsEntityT, "likes")
                                .where("likes.status = 'Like'")
                                .andWhere("likes.postsId = :postId", { postId: post.postId })
                        },
                        'countLike'
                    )
                    .where("l.status = 'Dislike'")
                    .andWhere("l.postsId = :postId", { postId: post.postId })
                    .getRawOne();


                const LatestThreeLikes = await this.likesInfoPosts
                    .createQueryBuilder('likes')
                    .leftJoinAndSelect('likes.users', 'u')
                    .where("likes.status = 'Like'")
                    .andWhere("likes.postsId = :postId", { postId: post.postId })
                    .orderBy("likes.createdAt", "DESC")
                    .limit(3)
                    .getMany()

                // Сортируем по убыванию даты


                if (!LatestThreeLikes[0]) {
                    return {
                        id: post.postId.toString(),
                        title: post.title,
                        shortDescription: post.shortDescription,
                        content: post.content,
                        blogId: post.blogs.blogId.toString(),
                        blogName: post.blogs.name,
                        createdAt: post.createdAt,
                        extendedLikesInfo: {
                            dislikesCount: +qureCountLikeDislike.countDislike,
                            likesCount: +qureCountLikeDislike.countLike,
                            myStatus: status || 'None',
                            newestLikes: []
                        }
                    }
                }



                const result = {
                    id: post.postId.toString(),
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogs.blogId.toString(),
                    blogName: post.blogs.name,
                    createdAt: post.createdAt,
                    extendedLikesInfo: {
                        dislikesCount: +qureCountLikeDislike.countDislike,
                        likesCount: +qureCountLikeDislike.countLike,
                        myStatus: status || 'None',
                        newestLikes: [...LatestThreeLikes.map(el => {
                            return {
                                addedAt: el.createdAt,
                                userId: el.users.userId.toString(),
                                login: el.users.login
                            }
                        })]
                    }
                }

                return result


            } catch (e) {

                console.log(e, "fsdfsdfsdfsdfsdfs")
            }

        })



        const userMapData = await Promise.all(promises)

        return userMapData;


    }

}

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PostsEntityT } from "../../posts/domain/posts.entityT";
import { PostsQuerySqlRepository } from "../../posts/infrastructure/posts.query.sql-repository";
import { BlogsEntityT } from "../domain/blog.entityT";
import { QueryBlogsParamsDto } from "../dto/dto.query.body";


@Injectable()
export class BlogsSqlQueryRepository {
    constructor(protected dataSource: DataSource, protected postsQuerySqlRepository: PostsQuerySqlRepository, @InjectRepository(BlogsEntityT) protected blogs: Repository<BlogsEntityT>, @InjectRepository(PostsEntityT) protected posts: Repository<PostsEntityT>) {
    }

    async getById(blogId: string) {

        try {
            const blog = await this.blogs.findOne({
                where: { blogId: +blogId }, // Используем `where` для указания условия поиска
            })

            return {
                id: blog.blogId.toString(),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }

        } catch (error) {
            console.log(error)

        }

    }

    async getBlogs(query: QueryBlogsParamsDto): Promise<any | { error: string }> {


        const sortBy = query.sortBy || 'createdAt'; // Поле сортировки, по умолчанию 'createdAt'
        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchNameTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;
        const pageNumber = query.pageNumber || 1;
        const pageSize = query.pageSize || 10;

        // Получаем репозиторий для работы с таблицей blogs

        try {
            // Выполняем запрос через queryBuilder
            const [items, totalCount] = await this.blogs
                .createQueryBuilder('b') // Псевдоним для таблицы 'bs'
                .where(searchNameTerm ? 'LOWER(b.name) LIKE :searchNameTerm' : '1=1', { searchNameTerm })
                .orderBy(`b.${sortBy} COLLATE "C"`, sortDirection) // Устанавливаем сортировку
                .skip((pageNumber - 1) * pageSize) // Пропускаем записи для пагинации
                .take(pageSize) // Ограничиваем размер страницы
                .getManyAndCount(); // Получаем данные и общее количество записей

            // Преобразуем данные в нужный формат
            const userMapData: any[] = items.map((blog) => ({
                id: `${blog.blogId}`,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }));

            // Возвращаем данные в виде объекта с метаинформацией
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize,
                totalCount,
                items: userMapData,
            };
        } catch (error) {
            console.error('Error fetching blogs:', error);
            throw new Error('Failed to fetch blogs');
        }


    }


    async getBlogsPosts(query: any, blogId: string, userId?: string): Promise<any | { error: string }> {







        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchTitleTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;

        // Используем репозиторий для PostsEntityT

        try {
            debugger

            // Создаем запрос с использованием queryBuilder
            // const [items, totalCount] = await this.posts
            //     .createQueryBuilder('p')
            //     .leftJoinAndSelect('p.blogs', 'b') // Создаем псевдоним 'p' для удобства
            //     .where('p.blogIdFk = :blogId', { blogId }) // Фильтрация по блогу
            // .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
            //     searchTitleTerm
            // })
            //     .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
            //     .skip((query.pageNumber - 1) * query.pageSize)
            //     .take(query.pageSize)
            //     .getManyAndCount(); // Получаем записи и их общее количество


            const [result, totalCount] = await this.posts
                .createQueryBuilder('p')
                .select('p.postId') // Берем только ID основной сущности
                .where('p.blogIdFk = :blogId', { blogId })
                .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .skip((query.pageNumber - 1) * query.pageSize)
                .take(query.pageSize)
                .getManyAndCount();

            const postIds = result.map(post => post.postId);

            // Второй запрос: подгружаем данные и связанные сущности
            const [mapPosts, s] = await this.posts
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogs', 'b')
                .where('p.postId IN (:...postIds)', { postIds })
                .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .getManyAndCount();

            // const userMapData: any[] = await this.postsQuerySqlRepository.mapPosts(items, userId);




            const postMap = mapPosts.map(post => {
                return {
                    id: post.postId.toString(),
                    blogName: post.blogName,
                    blogId: post.blogs.blogId.toString(),
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
                }
            })
            return {
                pagesCount: +Math.ceil(totalCount / query.pageSize),
                page: +query.pageNumber,
                pageSize: +query.pageSize,
                totalCount: +totalCount,
                items: postMap,
            };
        } catch (error) {
            console.log('Error fetching posts:', error);
        }



    }


}

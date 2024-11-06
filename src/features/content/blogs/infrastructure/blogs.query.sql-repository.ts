import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginatorT, ResultObject } from "../../../../utilit/TYPE/generalType";
import { PostsEntityT } from "../../posts/domain/posts.entityT";
import { PostsQuerySqlRepository } from "../../posts/infrastructure/posts.query.sql-repository";
import { BlogsEntityT } from "../domain/blog.entityT";
import { QueryBlogsParamsDto } from "../dto/dto.query.body";
import { blogOutputT } from "../type/type";


@Injectable()
export class BlogsSqlQueryRepository {
    constructor(protected dataSource: DataSource, protected postsQuerySqlRepository: PostsQuerySqlRepository, @InjectRepository(BlogsEntityT) protected blogs: Repository<BlogsEntityT>, @InjectRepository(PostsEntityT) protected posts: Repository<PostsEntityT>) {
    }

    async getById(blogId: string): Promise<ResultObject<blogOutputT | null>> {

        try {
            const blog = await this.blogs.findOne({
                where: { blogId: +blogId }, // Используем `where` для указания условия поиска
            })
            return {
                result: true,
                errorMessage: '',
                data: {
                    id: blog.blogId.toString(),
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl,
                    createdAt: blog.createdAt,
                    isMembership: blog.isMembership,
                }
            }



        } catch (error) {
            console.log(error)

            return {
                result: false,
                errorMessage: 'error when receiving blog',
                data: null
            }

        }

    }

    async getBlogs(query: QueryBlogsParamsDto): Promise<ResultObject<PaginatorT<blogOutputT> | null>> {
        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchNameTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;
        // Получаем репозиторий для работы с таблицей blogs

        try {
            // Выполняем запрос через queryBuilder
            const [items, totalCount] = await this.blogs
                .createQueryBuilder('b') // Псевдоним для таблицы 'bs'
                .where(searchNameTerm ? 'LOWER(b.name) LIKE :searchNameTerm' : '1=1', { searchNameTerm })
                .orderBy(`b.${query.sortBy} COLLATE "C"`, sortDirection) // Устанавливаем сортировку
                .skip((query.pageNumber - 1) * query.pageSize) // Пропускаем записи для пагинации
                .take(query.pageSize) // Ограничиваем размер страницы
                .getManyAndCount(); // Получаем данные и общее количество записей

            // Преобразуем данные в нужный формат
            const userMapData: blogOutputT[] = items.map((blog: BlogsEntityT) => ({
                id: `${blog.blogId}`,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            }));


            return {
                result: true,
                errorMessage: '',
                data: {
                    pagesCount: Math.ceil(totalCount / query.pageSize),
                    page: query.pageNumber,
                    pageSize: query.pageSize,
                    totalCount,
                    items: userMapData,
                }
            }




        } catch (error) {
            return {
                result: false,
                errorMessage: `error when receiving blog: ${error}`,
                data: null
            }
        }


    }


    async getBlogsPosts(query: any, blogId: string, userId?: string): Promise<ResultObject<PaginatorT<blogOutputT> | null>> {
        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const searchTitleTerm = query.searchNameTerm ? `%${query.searchNameTerm.toLowerCase()}%` : null;


        try {

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
            const mapPosts = await this.posts
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogs', 'b')
                .where('p.postId IN (:...postIds)', { postIds })
                .andWhere(searchTitleTerm ? 'LOWER(p.title) LIKE :searchTitleTerm' : '1=1', {
                    searchTitleTerm
                })
                .orderBy(`p.${query.sortBy} COLLATE "C"`, sortDirection)
                .getMany();

            const userMapData: any[] = await this.postsQuerySqlRepository.mapPosts(mapPosts, userId);

            return {

                result: true,
                errorMessage: '',
                data: {
                    pagesCount: +Math.ceil(totalCount / query.pageSize),
                    page: +query.pageNumber,
                    pageSize: +query.pageSize,
                    totalCount: +totalCount,
                    items: userMapData,
                }
            };
        } catch (error) {
            console.log('Error fetching posts:', error);
            return {
                result: false,
                errorMessage: 'Error fetching posts',
                data: null
            }
        }
    }



}




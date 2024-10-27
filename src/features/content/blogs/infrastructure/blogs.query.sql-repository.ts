import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { PostsQuerySqlRepository } from "../../posts/infrastructure/posts.query.sql-repository";
import { QueryBlogsParamsDto } from "../dto/dto.query.body";
import { BlogViewModelDbT } from "../TYPE/typeBlog";


@Injectable()
export class BlogsSqlQueryRepository {
    constructor(protected dataSource: DataSource, protected postsQuerySqlRepository: PostsQuerySqlRepository) {
    }

    async getById(blogId: string) {
        const qureBlog = `
         SELECT *
         FROM blogs
         WHERE blog_id = $1
        `
        const parameter = [blogId]

        try {
            const blog = await this.dataSource.query(qureBlog, parameter)
            return {
                id: blog[0].blog_id.toString(),
                name: blog[0].name,
                description: blog[0].description,
                websiteUrl: blog[0].website_url,
                createdAt: blog[0].created_at,
                isMembership: blog[0].is_membership,
            }


        } catch (error) {
            console.log(error)
        }
    }

    async getBlogs(query: QueryBlogsParamsDto): Promise<any | { error: string }> {



        const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'

        const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

        const queryuUserTable = `
        SELECT *
        FROM blogs
        WHERE (LOWER(name) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        ORDER BY ${sortBy} COLLATE "C" ${sortDirection} 
        LIMIT $2 OFFSET $3;
    `;

        const parametr = [query.searchNameTerm || '', query.pageSize, (query.pageNumber - 1) * query.pageSize];

        const items = await this.dataSource.query(queryuUserTable, parametr)


        const userMapData: BlogViewModelDbT[] = items.map((blog: any) => {
            return {
                id: `${blog.blog_id}`,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.website_url,
                createdAt: blog.created_at,
                isMembership: blog.is_membership
            };
        });


        const countQuery = `
        SELECT COUNT(*)
        FROM blogs
        WHERE (LOWER(name) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
    `;
        const countParams = [query.searchNameTerm || ''];
        const totalItemsResult = await this.dataSource.query(countQuery, countParams);
        const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее 


        return {
            pagesCount: Math.ceil(totalCount / query.pageSize),
            page: +query.pageNumber,
            pageSize: +query.pageSize,
            totalCount: totalCount,
            items: userMapData,
        };




        // debugger
        // const search = query.searchNameTerm ? { name: { $regex: query.searchNameTerm, $options: "i" } } : {};
        // const filter = {
        //     ...search,
        // };
        // try {
        //     const items: BlogViewModelDbT[] = await this.blogModel
        //         .find(filter)
        //         .sort({ [query.sortBy]: query.sortDirection as SortDirection })
        //         .skip((query.pageNumber - 1) * query.pageSize)
        //         .limit(query.pageSize).lean();

        //     const totalCount = await this.blogModel.countDocuments(filter);

        //     const mapBlogs: BlogViewModelT[] = items.map((blog: BlogViewModelDbT) => {
        //         return {
        //             id: blog._id,
        //             createdAt: blog.createdAt,
        //             description: blog.description,
        //             isMembership: blog.isMembership,
        //             name: blog.name,
        //             websiteUrl: blog.websiteUrl,
        //         };
        //     });
        //     return {
        //         pagesCount: +Math.ceil(totalCount / query.pageSize),
        //         page: +query.pageNumber,
        //         pageSize: +query.pageSize,
        //         totalCount: +totalCount,
        //         items: mapBlogs,
        //     };
        // } catch (e) {
        //     return { error: "some error" };
        // }
    }


    async getBlogsPosts(query: any, blogid: string, userId?: string): Promise<any | { error: string }> {

        const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'

        const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

        const queryuUserTable = `
        SELECT *
        FROM posts
        WHERE (LOWER(title) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        AND fk_blog = $2
        ORDER BY ${sortBy} COLLATE "C" ${sortDirection} 
        LIMIT $3 OFFSET $4;
    `;

        const parametr = [query.searchNameTerm || '', blogid, query.pageSize, (query.pageNumber - 1) * query.pageSize];

        const items = await this.dataSource.query(queryuUserTable, parametr)

        const userMapData: any[] = await this.postsQuerySqlRepository.mapPosts(items, userId)


        const countQuery = `
        SELECT COUNT(*)
        FROM posts
        WHERE (LOWER(title) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
        AND fk_blog = $2
    `;
        const countParams = [query.searchNameTerm || '', blogid];
        const totalItemsResult = await this.dataSource.query(countQuery, countParams);
        const totalCount = parseInt(totalItemsResult[0].count, 10); // Общее 



        return {
            pagesCount: Math.ceil(totalCount / query.pageSize),
            page: +query.pageNumber,
            pageSize: +query.pageSize,
            totalCount: totalCount,
            items: userMapData,
        };

    }


}

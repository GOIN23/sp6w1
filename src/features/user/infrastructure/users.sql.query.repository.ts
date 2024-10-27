import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { PaginatorUsers, UserViewModel2 } from "../../../utilit/TYPE/typeUser";
import { QueryParamsDto } from "../../../utilit/dto/dto.query.user";
import { UserOutputModel, UserOutputModelMapper } from '../models/output/user.output.model';
@Injectable()
export class UsersSqlQueryRepository {
    constructor(protected dataSource: DataSource) {
    }

    async getById(userId: string): Promise<UserOutputModel> {

        const queryuUserTable = `
            SELECT *
            FROM users
            WHERE user_id = $1
        `;

        const parameter = [userId]

        try {
            const user = await this.dataSource.query(queryuUserTable, parameter)


            return UserOutputModelMapper(user[0]);

        } catch (error) {
            //@ts-ignore
            return false

        }
    }

    async getUsers(query: QueryParamsDto): Promise<PaginatorUsers | { error: string }> {
        debugger

        const sortBy = query.sortBy || 'created_at'; // по умолчанию сортировка по 'login'

        const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

        const queryuUserTable = `
        SELECT *
        FROM users
        WHERE (LOWER(email) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
          AND (LOWER(login) LIKE LOWER(CONCAT('%', $2::TEXT, '%')) OR $2 IS NULL)
        ORDER BY ${sortBy} COLLATE "C" ${sortDirection} 
        LIMIT $3 OFFSET $4;
    `;

        const parametr = [query.searchEmailTerm || '', query.searchLoginTerm || '', query.pageSize, (query.pageNumber - 1) * query.pageSize];

        const items = await this.dataSource.query(queryuUserTable, parametr)


        const userMapData: UserViewModel2[] = items.map((user: any) => {
            return {
                id: String(user.user_id),
                login: user.login,
                email: user.email,
                //@ts-ignore
                createdAt: user.created_at,
            };
        });


        const countQuery = `
        SELECT COUNT(*)
        FROM users
        WHERE (LOWER(email) LIKE LOWER(CONCAT('%', $1::TEXT, '%')) OR $1 IS NULL)
          AND (LOWER(login) LIKE LOWER(CONCAT('%', $2::TEXT, '%')) OR $2 IS NULL);
    `;
        const countParams = [query.searchEmailTerm || '', query.searchLoginTerm || ''];
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




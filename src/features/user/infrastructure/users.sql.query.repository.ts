import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginatorUsers, UserViewModel2 } from "../../../utilit/TYPE/typeUser";
import { QueryParamsDto } from "../../../utilit/dto/dto.query.user";
import { UserEnity } from "../domain/entity.user";
import { UserOutputModel } from '../models/output/user.output.model';
@Injectable()
export class UsersSqlQueryRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(UserEnity)
    protected users: Repository<UserEnity>) {
    }

    async getById(userId: string): Promise<UserOutputModel> {
        debugger


        try {
            const user = await this.users.findOne({
                where: { userId: +userId },
            })

            return {
                id: user.userId.toString(),
                email: user.email,
                createdAt: user.createdAt.toString(),
                login: user.login
            }




        } catch (e) {
            console.log(e)

        }







    }

    async getUsers(query: QueryParamsDto): Promise<PaginatorUsers> {
        debugger
        try {
            const sortDirection = query.sortDirection === 'desc' ? 'DESC' : 'ASC';

            const searchEmailTerm = query.searchEmailTerm ? `%${query.searchEmailTerm.toLowerCase()}%` : null;
            const searchLoginTerm = query.searchLoginTerm ? `%${query.searchLoginTerm.toLowerCase()}%` : null;


            const queryBuilder = this.users.createQueryBuilder('u');

            // Добавляем условия фильтрации
            if (searchEmailTerm && searchLoginTerm) {
                queryBuilder.andWhere(
                    `(LOWER(u.email) LIKE :searchEmailTerm OR LOWER(u.login) LIKE :searchLoginTerm)`,
                    { searchEmailTerm, searchLoginTerm }
                );
            } else if (searchEmailTerm) {
                queryBuilder.andWhere('LOWER(u.email) LIKE :searchEmailTerm', { searchEmailTerm });
            } else if (searchLoginTerm) {
                queryBuilder.andWhere('LOWER(u.login) LIKE :searchLoginTerm', { searchLoginTerm });
            }


            // Добавляем сортировку и пагинацию
            queryBuilder
                .orderBy(`u.${query.sortBy} COLLATE "C"`, sortDirection)
                .skip((query.pageNumber - 1) * query.pageSize)
                .take(query.pageSize);


            const [items, totalCount] = await queryBuilder.getManyAndCount();

            // Форматируем результаты
            const userMapData: UserViewModel2[] = items.map((user) => {
                return {
                    id: user.userId.toString(),
                    login: user.login,
                    email: user.email,
                    createdAt: user.createdAt.toString(),
                };
            });

            return {
                pagesCount: Math.ceil(totalCount / query.pageSize),
                page: query.pageNumber,
                pageSize: query.pageSize,
                totalCount: totalCount,
                items: userMapData,
            };

        } catch (e) {
            console.log(e)
        }


    }
}




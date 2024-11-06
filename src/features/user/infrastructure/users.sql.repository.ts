import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { ResultObject } from "../../../utilit/TYPE/generalType";
import { User } from "../domain/createdBy-user-Admin.entity";
import { EmailConfirmation } from "../domain/entity.email.confirmation";
import { UserEnity } from "../domain/entity.user";


@Injectable()
export class UsersSqlRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(UserEnity)
    protected users: Repository<UserEnity>, @InjectRepository(EmailConfirmation)
        protected emailConfirmation: Repository<EmailConfirmation>
    ) { }
    async creatInDbUser(user: User) {

        const result = await this.users.insert({
            login: user.login,
            createdAt: user.createdAt,
            email: user.email,
            passwordHash: user.passwordHash,
            passwordSalt: user.passwordSalt,
        });


        console.log(result.identifiers[0].userId, "result.identifiers[0].userIdresult.identifiers[0].userIdresult.identifiers[0].userIdresult.identifiers[0].userId")


        await this.emailConfirmation.insert({
            user: result.identifiers[0].userId,
            confirmationCode: user.emailConfirmation.confirmationCode,
            expirationDate: user.emailConfirmation.expirationDate,
            isConfirmed: user.emailConfirmation.isConfirmed
        })



        return result.identifiers[0].userId;



    }
    async findinDbUser(userid: string) {
        try {
            const user = await this.users.findOne({
                where: { userId: +userid }, // Используем `where` для указания условия поиска
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
    async findIsLogin(login: string): Promise<ResultObject<UserEnity | null>> {




        const user = await this.users.findOne({
            where: { login: login }, // Используем `where` для указания условия поиска
        })
        if (!user) {
            return {
                result: false,
                errorMessage: `no user with such logins:${login}`,
                data: null
            }
        }

        return {
            result: true,
            errorMessage: `there is a user with such logins:${login}`,
            data: user
        }






    }
    async checkingNumberRequests(metaData: any, data: Date) {


        const result = await this.dataSource.query(
            `SELECT COUNT(*)
             FROM rate_limit
             WHERE "ip" = $1
               AND "url" = $2
               AND "data" >= NOW() - INTERVAL '10 seconds';`,
            [metaData.ip, metaData.url]
        );

        return result[0]

    }
    async addRateLlimit(metaData: any) {


        const queryuUserTable = `
        INSERT INTO rate_limit (data, ip, url)
        VALUES ($1, $2, $3)
        `;
        const parametersUserTable = [metaData.data, metaData.ip, metaData.url]


        await this.dataSource.query(queryuUserTable, parametersUserTable)
    }
    async findIsEmail(email: string): Promise<ResultObject<UserEnity | null>> {



        const user = await this.users.findOne({
            where: { email: email }, // Используем `where` для указания условия поиска
        })
        if (!user) {
            return {
                result: false,
                errorMessage: `no user with such email:${email}`,
                data: null
            }
        }

        return {
            result: true,
            errorMessage: `there is a user with such email:${email}`,
            data: user
        }




    }
    async deletUser(id: string) {

        try {
            await this.users.delete({ userId: +id })

        } catch (e) {
            console.log(e)
        }
    }
    async findBlogOrEmail(loginOrEmail: string): Promise<any | null> {
        try {
            const user = await this.users.createQueryBuilder('u')
                .leftJoinAndSelect('u.emailConfirmation', 'e') // Используем left join
                .where('u.login = :loginOrEmail OR u.email = :loginOrEmail', { loginOrEmail }) // Используем параметризированные запросы
                .getOne(); // Возвращает один результат или null

            if (!user) {
                return null; // Если пользователь не найден, возвращаем null
            }

            return {
                _id: user.userId,
                createdAt: user.createdAt,
                email: user.email,
                login: user.login,
                passwordHash: user.passwordHash,
                passwordSalt: user.passwordSalt,
                isConfirmed: user.emailConfirmation?.isConfirmed, // Если emailConfirmation может быть undefined
            };
        } catch (error) {
            console.error(error); // Логируем ошибку для отладки
            return false; // Обработка ошибок
        }

    }
    async findUserByConfirEmail(code: string) {
        try {
            const result = await this.emailConfirmation
                .createQueryBuilder('e')
                .select(['e.confirmationCode', 'e.isConfirmed', 'e.expirationDate', 'user.userId'])
                .leftJoin('e.user', 'user') // Используем связь для JOIN
                .where('e.confirmationCode = :code', { code })
                .getOne(); // Получаем одну запись

            return result;

        } catch (error) {
            console.error('Error finding user by confirmation code:', error);
            return null; // Или выбросьте ошибку, если необходимо
        }
    }
    async updateConfirmation(userId: string) {


        try {
            const result = await this.emailConfirmation
                .createQueryBuilder()
                .update(EmailConfirmation)
                .set({ isConfirmed: true }) // Устанавливаем isConfirmed в true
                .where('fk_users_id = :userId', { userId }) // Фильтруем по userId
                .execute(); // Выполняем запрос


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error confirming email:', error);
            return false; // Возвращаем false в случае ошибки
        }


    }
    async updateCodeUserByConfirEmail(userID: string, code: string) {

        try {
            const result = await this.emailConfirmation
                .createQueryBuilder()
                .update(EmailConfirmation)
                .set({ confirmationCode: code }) // Устанавливаем confirmation_code
                .where('fk_users_id = :userId', { userId: userID }) // Фильтруем по userID
                .execute(); // Выполняем запрос


            return result.affected > 0; // Возвращаем true, если обновление прошло успешно

        } catch (error) {
            console.error('Error updating confirmation code:', error);
            return false; // Возвращаем false в случае ошибки
        }

    }
    async updatePassword(email: string, newPasswordHash: string, newPasswordSalt: string): Promise<void> {

        try {
            await this.users
                .createQueryBuilder()
                .update(UserEnity)
                .set({ passwordHash: newPasswordHash, passwordSalt: newPasswordSalt }) // Устанавливаем новое значение для lastActiveDate
                .where('"email" = :email', { email })
                .execute();
        } catch (error) {
            console.error('Error updating session:', error);
        }





    }
}

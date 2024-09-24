import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "../domain/createdBy-user-Admin.entity";


@Injectable()
export class UsersSqlRepository {
    constructor(protected dataSource: DataSource) { }
    async creatInDbUser(user: User) {
        const { emailConfirmation, ...userTable } = user

        const queryuUserTable = `
        INSERT INTO users (login, email, password_hash, password_salt, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id;
        `;
        const parametersUserTable = [userTable.login, userTable.email, userTable.passwordHash, userTable.passwordSalt, new Date().toISOString()]


        const userId = await this.dataSource.query(queryuUserTable, parametersUserTable)


        const queryuEmailConfirmationTable = `
        INSERT INTO email_confirmation (fk_users_id, expiration_date, confirmation_code, is_confirmed)
        VALUES ($1, $2, $3, $4);
        `;

        const parametersEmailConfirmationTable = [userId[0].user_id, emailConfirmation.expirationDate, emailConfirmation.confirmationCode, emailConfirmation.isConfirmed]



        await this.dataSource.query(queryuEmailConfirmationTable, parametersEmailConfirmationTable)

        return userId[0].user_id

    }
    async findinDbUser(userid: string) {
        const queryuUserTable = `
        SELECT *
        FROM users
        WHERE user_id = $1
    `
        const parameter = [userid]

        try {
            const user = await this.dataSource.query(queryuUserTable, parameter)
            return user[0]

        } catch (error) {
            console.log(error)
        }



    }
    async findIsLogin(login: string) {

        const queryuUserTable = `
        SELECT *
        FROM users
        WHERE login = $1
    `
        const parameter = [login]

        try {
            const userLogin = await this.dataSource.query(queryuUserTable, parameter)
            return userLogin[0]

        } catch (error) {
            console.log(error)
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
    async findIsEmail(email: string) {
        const queryuUserTable = `
        SELECT *
        FROM users
        WHERE email = $1
    `

        const parameter = [email]
        try {
            const userEmail = await this.dataSource.query(queryuUserTable, parameter)

            return userEmail[0]

        } catch (error) {
            console.log(error)
        }
    }
    async deletUser(id: string) {
        const queryuUserTable = `
        DELETE FROM users
        WHERE user_id = $1
        `;

        const ueryuUserEmailConfirmation = `
        DELETE FROM email_confirmation
        WHERE email_confirmation.fk_users_id = $1;
        `

        const parametr = [id]


        try {
            await this.dataSource.query(ueryuUserEmailConfirmation, parametr)
            await this.dataSource.query(queryuUserTable, parametr)

        } catch (error) {
            console.log(error)

        }
    }
}


import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeviceSesions } from '../domain/sesion-auth.entity';


@Injectable()
export class UsersAuthSqlRepository {
    constructor(protected dataSource: DataSource) { }


    // async findUsers(id: string | undefined) {
    //     const result = await this.userModel.findOne({ _id: id });
    //     if (!result) {
    //         return null;
    //     }
    //     return result;
    // }

    async findBlogOrEmail(loginOrEmail: string): Promise<any | null> {

        const queryuUserTable = `
          SELECT *
          FROM users
          LEFT JOIN email_confirmation ON fk_users_id = user_id
          WHERE login = $1 OR email = $1
    `

        try {
            const user = await this.dataSource.query(queryuUserTable, [loginOrEmail])


            if (!user) {
                return null
            }

            return {
                _id: user[0].user_id,
                createdAt: user[0].created_at,
                email: user[0].email,
                login: user[0].login,
                passwordHash: user[0].password_hash,
                passwordSalt: user[0].password_salt,
                isConfirmed: user[0].is_confirmed
            };
        } catch (error) {
            return false

        }

    }

    async findUserByConfirEmail(code: string) {

        const queryuUserTable = `
        SELECT user_id, confirmation_code, is_confirmed, expiration_date
        FROM email_confirmation
        LEFT JOIN users
        ON fk_users_id = user_id
        WHERE confirmation_code = $1
    `

        const parameter = [code]
        try {
            const user = await this.dataSource.query(queryuUserTable, parameter)


            return user[0]

        } catch (error) {
            console.log(error)

        }



    }

    async updateConfirmation(user_id: string) {

        const queryuUserTable = `
        UPDATE email_confirmation
        SET is_confirmed = $1
        WHERE fk_users_id = $2;
    `;


        const parameters = [true, user_id];
        try {
            await this.dataSource.query(queryuUserTable, parameters)
            console.log('Executing query with parameters:', parameters);


            return true
        } catch (error) {
            console.log(error)
            return false

        }


    }

    async updateCodeUserByConfirEmail(userID: string, code: string) {

        const queryuUserTable = `
        UPDATE email_confirmation
        SET confirmation_code = $1
        WHERE fk_users_id = $2;
    `;
        const parameter = [code, userID]

        try {
            await this.dataSource.query(queryuUserTable, parameter)

        } catch (error) {
            console.log(error)

        }

    }

    async postPasswordRecoveryCode(code: string, email: string) {
        const queryuRecoveryPasswordTable = `
        INSERT INTO recovery_password (code, email)
        VALUES($1,$2)
        `;


        const parameter = [code, email]

        try {
            const sesion = await this.dataSource.query(queryuRecoveryPasswordTable, parameter)
            return sesion[0]

        } catch (error) {
            console.log(error)
        }
    }

    async checkPasswordRecoveryCode(code: string) {
        const queryuRecoveryPasswordTable = `
        SELECT *
        FROM recovery_password
        WHERE code = $1
        `;
        const parameter = [code]

        try {
            const recoveryPassword = await this.dataSource.query(queryuRecoveryPasswordTable, parameter)
            return recoveryPassword[0]

        } catch (error) {
            console.log(error)
        }
    }

    async updatePassword(email: string, newPasswordHash: string, newPasswordSalt: string): Promise<void> {
        const queryuUserTable = `
        UPDATE users
        SET password_hash = $1,
            password_salt = $2
        WHERE email = $3;
    `;

        const parameter = [newPasswordHash, newPasswordSalt, email]

        try {
            await this.dataSource.query(queryuUserTable, parameter)

        } catch (error) {
            console.log(error)
        }

    }

    async addSesionUser(userSession: DeviceSesions) {
        const queryuSesionTable = `
        INSERT INTO device_sesions (device_id, ip, last_active_date, title, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id;
        `;
        const parametersUserTable = [userSession.deviceId, userSession.ip, userSession.lastActiveDate, userSession.title, userSession.userId]

        try {
            await this.dataSource.query(queryuSesionTable, parametersUserTable)

        } catch (error) {
            console.log(error)
        }

    }

    async findRottenSessions(userId: string, deviceId: string) {

        const queryuSesionTable = `
        SELECT *
        FROM device_sesions
        WHERE device_id = $1 AND user_id = $2
        `;


        const parametr = [deviceId, userId]

        try {
            const sesion = await this.dataSource.query(queryuSesionTable, parametr)
            return sesion[0]

        } catch (error) {
            console.log(error)
        }

    }

    async completelyRemoveSesion(deviceId: string, userId: string) {

        const queryuSesionTable = `
        DELETE FROM device_sesions
        WHERE user_id = $1 AND device_id = $2
        `;

        const parametrs = [userId, deviceId]

        try {
            await this.dataSource.query(queryuSesionTable, parametrs)

        } catch (error) {
            console.log(error)
        }

    }

    async updateSesionUser(iat: string, userId: string, diveceId: string) {
        const queryuSesionTable = `
        UPDATE device_sesions
        SET last_active_date = $1
        WHERE user_id = $2 AND device_id = $3;
    `;

        const parameter = [iat, userId, diveceId]

        try {
            await this.dataSource.query(queryuSesionTable, parameter)

        } catch (error) {
            console.log(error)
        }



    }
    async getSesions(userId: string) {

        const queryuSesionTable = `
        SELECT *
        FROM device_sesions
        WHERE user_id = $1
        `

        const parameter = [userId]

        try {
            const sesion = await this.dataSource.query(queryuSesionTable, parameter)

            const mapDateSesio = sesion.map((d) => {
                return {
                    deviceId: d.device_id,
                    ip: d.ip,
                    lastActiveDate: new Date(+d.last_active_date * 1000),
                    title: d.title,
                };
            });
            return mapDateSesio;

        } catch (error) {
            console.log(error)
        }

    }
    async getSesionsId(deviceId: string) {
        const queryuSesionTable = `
        SELECT *
        FROM device_sesions
        WHERE device_id = $1
        `

        const parameter = [deviceId]

        try {
            const sesion = await this.dataSource.query(queryuSesionTable, parameter)

            return sesion[0]

        } catch (error) {
            console.log(error)
        }
    }

    async deleteSesions(deviceId: string, userId: string) {

        const queryuSesionTable = ` 
        DELETE FROM device_sesions
        WHERE device_id <> $1 AND user_id = $2
        `

        const parameter = [deviceId, userId]

        try {
            await this.dataSource.query(queryuSesionTable, parameter)
        } catch (error) {
            console.log(error)
        }

    }
    async deleteSesionsId(deviceId: string) {
        const queryuSesionTable = ` 
        DELETE FROM device_sesions
        WHERE device_id = $1
        `

        const parameter = [deviceId]

        try {
            await this.dataSource.query(queryuSesionTable, parameter)
        } catch (error) {
            console.log(error)
        }
    }
}

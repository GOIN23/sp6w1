import { INestApplication } from "@nestjs/common";
import * as request from 'supertest';
import { DataSource } from "typeorm";




export class AuthTestMannager {
    alphabetLower = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];
    constructor(protected app: INestApplication, protected dataSource: DataSource) { }



    async registrationUser(body: any,) {

        const result = await request(this.app.getHttpServer())
            .post('/api/auth/registration')
            .send(body)


        return result
    }


    async registrationUsers(number: number) {

        const datainformation = []


        for (let i = 0; i < number; i++) {
            const dataCurrent = {
                login: `${this.alphabetLower[i]}fdgfdgd`,
                password: "string",
                email: `${this.alphabetLower[i]}e5.kn@mail.ru`
            }
            await request(this.app.getHttpServer())
                .post('/api/auth/registration')
                .send(dataCurrent)

            datainformation.push(dataCurrent)
        }



        return datainformation
    }




    async findUser(loginOrEmail: string) {

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

            return user[0]
        } catch (error) {
            return false

        }



    }

    async login(input: any) {
        return await request(this.app.getHttpServer())
            .post(`/api/auth/login`)
            .send(input)
    }

    async getDivece(userId: string) {
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


}
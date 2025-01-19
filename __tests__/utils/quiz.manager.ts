import { INestApplication } from "@nestjs/common";
import * as request from 'supertest';
import { DataSource } from "typeorm";
import { AuthTestMannager } from "./auth-test-manager";





const credentials = "admin:qwerty"


const buff2 = Buffer.from(credentials, "utf8");
const codedAuth: string = buff2.toString("base64");



export class QuizMamager {
    alphabetLower: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];
    authTestManger: AuthTestMannager
    constructor(protected app: INestApplication) {
        const dataSource = app.get(DataSource);
        this.authTestManger = new AuthTestMannager(app, dataSource);

    }

    async createPair(input: any) {
        await this.authTestManger.registrationUser(input)
        const tokens = await this.authTestManger.login({ loginOrEmail: input.login, password: input.password })


        const result = await request(this.app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/connection')
            .set({ Authorization: "Bearer " + tokens.body.accessToken })



        console.log(result.body, tokens.body.accessToken, "fsdfsdfsdfsdfsdf")
        return result.body

    }

    async createPairFull(inputUserOne: any, inputUserTwo: any) {
        const data = [inputUserOne, inputUserTwo,]
        let result



        for (let i = 0; i < 2; i++) {
            await this.authTestManger.registrationUser(data[i])
            const tokens = await this.authTestManger.login({ loginOrEmail: data[i].login, password: data[i].password })

            result = await request(this.app.getHttpServer())
                .post('/api/pair-game-quiz/pairs/connection')
                .set({ Authorization: "Bearer " + tokens.body.accessToken })


        }
        return result.body
    }

}
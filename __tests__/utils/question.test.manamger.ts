import { INestApplication } from "@nestjs/common";
import * as request from 'supertest';
import { inputQuestionsCreateT } from "../../src/features/quiz/type/quizType";





const credentials = "admin:qwerty"


const buff2 = Buffer.from(credentials, "utf8");
const codedAuth: string = buff2.toString("base64");



export class QuestionMamager {
    alphabetLower: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];

    constructor(protected app: INestApplication) {

    }


    async createQuestion(input: inputQuestionsCreateT) {

        const question = await request(this.app.getHttpServer())
            .post(`/api/quiz/questions`)
            .set({ Authorization: "Basic " + codedAuth })
            .send(input)

        return question.body


    }

    async createQuestions(count: number) {

        for (let i = 0; i < count; i++) {
            const obj: any = {
                body: `${this.alphabetLower[i]}SFSgfgfgfgfgfFS`,
                correctAnswers: [`DS${this.alphabetLower[i]}F`, `${this.alphabetLower[i]}FSDFSD`],
            }

            await request(this.app.getHttpServer())
                .post(`/api/sa/quiz/questions`)
                .set({ Authorization: "Basic " + codedAuth })
                .send(obj)

        }


        for (let i = 1; i <= count; i++) {

            await request(this.app.getHttpServer())
                .put(`/api/sa/quiz/questions/${i}/publish`)
                .set({ Authorization: "Basic " + codedAuth })
                .send({
                    published: true
                })

        }


        const res = await request(this.app.getHttpServer())
            .get(`/api/sa/quiz/questions`)
            .set({ Authorization: "Basic " + codedAuth })


        return res.body

    }
}
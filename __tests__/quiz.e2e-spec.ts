import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { EmailAdapter } from "../src/features/auth/application/emai-Adapter";
import { applyAppSettings } from "../src/settings/apply-app-setting";
import { EmailAdapterMock } from "./mock/email.adapter.mock";
import { aDescribe } from "./utils/aDescribe";
import { AuthTestMannager } from "./utils/auth-test-manager";
import { QuestionMamager } from "./utils/question.test.manamger";
import { QuizMamager } from "./utils/quiz.manager";
import { skipSettings } from "./utils/skip-settings";





aDescribe(skipSettings.for('quizTest'))("user test", () => {
    let app: INestApplication;
    let authTestManger: AuthTestMannager;
    let questionMamager: QuestionMamager
    let quizMamager: QuizMamager

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideProvider(EmailAdapter)
            .useClass(EmailAdapterMock)
            .compile();


        app = moduleFixture.createNestApplication()


        // Применяем все настройки приложения (pipes, guards, filters, ...)
        applyAppSettings(app);
        await app.init();
        const dataSource = app.get(DataSource);
        authTestManger = new AuthTestMannager(app, dataSource);
        questionMamager = new QuestionMamager(app)
        quizMamager = new QuizMamager(app)
        console.log(process.env.ENV, "testesteeets");


    });

    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });



    it("+ creating a pair and receiving questions", async () => {
        const userOneData = {
            login: "fdgfdgd",
            password: "string",
            email: "9e9.kn@mail.ru"
        }
        const userTwoData = {
            login: "ali232",
            password: "string",
            email: "1e1.kn@mail.ru"
        }

        await authTestManger.registrationUser(userOneData)


        await questionMamager.createQuestions(10)


        const tokens = await authTestManger.login({ loginOrEmail: userOneData.login, password: userOneData.password })


        const result = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/connection')
            .set({ Authorization: "Bearer " + tokens.body.accessToken })



        expect(result.body).toEqual({
            id: 1,
            firstPlayerProgress: {
                answers: [],
                player: {
                    id: '1',
                    login: 'fdgfdgd'
                },
                score: 0
            },
            secondPlayerProgress: null,
            status: 'PendingSecondPlayer',
            pairCreatedDate: expect.any(String),
            startGameDate: null,
            finishGameDate: null,
            questions: [],

        })


        await authTestManger.registrationUser(userTwoData)

        const tokensTwoUser = await authTestManger.login({ loginOrEmail: userTwoData.login, password: userTwoData.password })

        const resultWithTwoUser = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/connection')
            .set({ Authorization: "Bearer " + tokensTwoUser.body.accessToken })


        console.log(resultWithTwoUser.body, "fsdfsdfsdfsd")
        expect(resultWithTwoUser.body).toEqual({
            id: 1,
            firstPlayerProgress: {
                answers: [], player:
                {
                    id: '1',
                    login: 'fdgfdgd'
                }, score: 0
            },
            secondPlayerProgress: {
                answers: [], player:
                    { id: '2', login: 'ali232' },
                score: 0
            },
            questions: [
                { id: 1, body: 'aSFSgfgfgfgfgfFS' },
                { id: 2, body: 'bSFSgfgfgfgfgfFS' },
                { id: 3, body: 'cSFSgfgfgfgfgfFS' },
                { id: 4, body: 'dSFSgfgfgfgfgfFS' },
                { id: 5, body: 'eSFSgfgfgfgfgfFS' }
            ],
            status: 'Active',
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null
        })

    })



})


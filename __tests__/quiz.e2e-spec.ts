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


    it("test postr", async () => {
        const questions = await questionMamager.createQuestions(10)

        console.log(questions, 'questionsquestionsquestions')
        questions.items.reverse()

        const userOneData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.k@mail.ru"
        }
        const userTwoData = {
            login: "ali232",
            password: "string",
            email: "4e1.kn@mail.ru"
        }

        await authTestManger.registrationUser(userOneData)

        await authTestManger.registrationUser(userTwoData)


        const tokensUserOne = await authTestManger.login({ loginOrEmail: userOneData.login, password: userOneData.password })
        const tokensUserTwo = await authTestManger.login({ loginOrEmail: userTwoData.login, password: userTwoData.password })



        await quizMamager.createPairFull(userOneData, userTwoData)



    })



    it("add answers to first game, created by user1, connected by user2: add correct answer by firstPlayer; add correct answer by firstPlayer; add correct answer by secondPlayer; add correct answer by secondPlayer; add incorrect answer by firstPlayer; add correct answer by firstPlayer; add correct answer by secondPlayer; firstPlayer should win with 5 scores; get active game and call  my - current by both users after each answer", async () => {
        const questions = await questionMamager.createQuestions(10)

        questions.items.reverse()

        const userOneData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.k@mail.ru"
        }
        const userTwoData = {
            login: "ali232",
            password: "string",
            email: "4e1.kn@mail.ru"
        }

        await authTestManger.registrationUser(userOneData)

        await authTestManger.registrationUser(userTwoData)


        const tokensUserOne = await authTestManger.login({ loginOrEmail: userOneData.login, password: userOneData.password })
        const tokensUserTwo = await authTestManger.login({ loginOrEmail: userTwoData.login, password: userTwoData.password })



        await quizMamager.createPairFull(userOneData, userTwoData)



        //add answers two coorect userOne a

        const resultAnswerOneUserOne = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .send({
                answer: questions.items[0].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerOneUserOne.body).toEqual({
            questionId: questions.items[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getOneMycurrentUserOne = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .expect(200)


        expect(getOneMycurrentUserOne.body.firstPlayerProgress.answers).toEqual([
            {
                questionId: questions.items[0].id,
                answerStatus: "Correct",
                addedAt: expect.any(String)
            }
        ])



        //two answer 

        const resultAnswerTwoUserOne = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .send({
                answer: questions.items[1].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerTwoUserOne.body).toEqual({
            questionId: questions.items[1].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getTwoMycurrentUserOne = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .expect(200)


        expect(getTwoMycurrentUserOne.body.firstPlayerProgress.answers).toEqual(
            [
                {
                    questionId: questions.items[0].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[1].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                }]
        )




        // add answers two coorect userTwo a


        const resultAnswerOneUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: questions.items[0].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerOneUserTwo.body).toEqual({
            questionId: questions.items[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getOneMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getOneMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual([
            {
                questionId: questions.items[0].id,
                answerStatus: "Correct",
                addedAt: expect.any(String)
            }
        ])



        // two answer 

        const resultAnswerTwoUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: questions.items[1].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerTwoUserTwo.body).toEqual({
            questionId: questions.items[1].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getTwoMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getTwoMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual(
            [
                {
                    questionId: questions.items[0].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[1].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                }]
        )





        //add incorrect userTwo 

        const resultAnswerThreeUserOne = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .send({
                answer: "Incorrect"
            })
            .expect(200)


        expect(resultAnswerThreeUserOne.body).toEqual({
            questionId: questions.items[2].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String)
        })


        const getThreMycurrentUserOne = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .expect(200)


        expect(getThreMycurrentUserOne.body.firstPlayerProgress.answers).toEqual(
            [
                {
                    questionId: questions.items[0].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[1].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[2].id,
                    answerStatus: "Incorrect",
                    addedAt: expect.any(String)
                },

            ]
        )


        //add one answer correct userTwo 
        const resultAnswerThreeUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: questions.items[2].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerThreeUserTwo.body).toEqual({
            questionId: questions.items[2].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getThreeMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getThreeMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual(
            [
                {
                    questionId: questions.items[0].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[1].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[2].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                }
            ]
        )



        //full awent

        const resultAnswerFourUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: questions.items[3].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerFourUserTwo.body).toEqual({
            questionId: questions.items[3].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })

        const getFourMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getFourMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual(
            [
                {
                    questionId: questions.items[0].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[1].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[2].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                },
                {
                    questionId: questions.items[3].id,
                    answerStatus: "Correct",
                    addedAt: expect.any(String)
                }
            ]
        )




    })

    it.only("add answers to first game, created by user1, connected by user2 add correct answer by firstPlayer; add incorrect answer by secondPlayer; add correct answer by secondPlayer; get my-cuurent active game and call by both users after each answe", async () => {
        const questions = await questionMamager.createQuestions(10)

        questions.items.reverse()

        const userOneData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.k@mail.ru"
        }
        const userTwoData = {
            login: "ali232",
            password: "string",
            email: "4e1.kn@mail.ru"
        }

        await authTestManger.registrationUser(userOneData)

        await authTestManger.registrationUser(userTwoData)


        const tokensUserOne = await authTestManger.login({ loginOrEmail: userOneData.login, password: userOneData.password })
        const tokensUserTwo = await authTestManger.login({ loginOrEmail: userTwoData.login, password: userTwoData.password })



        await quizMamager.createPairFull(userOneData, userTwoData)

        const resultAnswerOneUserOne = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .send({
                answer: questions.items[0].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerOneUserOne.body).toEqual({
            questionId: questions.items[0].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getOneMycurrentUserOne = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserOne.body.accessToken })
            .expect(200)


        expect(getOneMycurrentUserOne.body.firstPlayerProgress.answers).toEqual([
            {
                questionId: questions.items[0].id,
                answerStatus: "Correct",
                addedAt: expect.any(String)
            }
        ])






        const resultAnswerOneUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: "Incorrect"
            })
            .expect(200)


        expect(resultAnswerOneUserTwo.body).toEqual({
            questionId: questions.items[0].id,
            answerStatus: "Incorrect",
            addedAt: expect.any(String)
        })


        const getOneMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getOneMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual([
            {
                questionId: questions.items[0].id,
                answerStatus: "Incorrect",
                addedAt: expect.any(String)
            }
        ])



        ///////////////////////



        const resultAnswerTwoUserTwo = await request(app.getHttpServer())
            .post('/api/pair-game-quiz/pairs/my-current/answers')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .send({
                answer: questions.items[1].correctAnswers[0]
            })
            .expect(200)


        expect(resultAnswerTwoUserTwo.body).toEqual({
            questionId: questions.items[1].id,
            answerStatus: "Correct",
            addedAt: expect.any(String)
        })


        const getTwoMycurrentUserTwo = await request(app.getHttpServer())
            .get('/api/pair-game-quiz/pairs/my-current')
            .set({ Authorization: "Bearer " + tokensUserTwo.body.accessToken })
            .expect(200)


        expect(getTwoMycurrentUserTwo.body.secondPlayerProgress.answers).toEqual([
            {
                questionId: questions.items[0].id,
                answerStatus: "Incorrect",
                addedAt: expect.any(String)
            }
            ,
            {
                questionId: questions.items[1].id,
                answerStatus: "Correct",
                addedAt: expect.any(String)
            }
        ])




    })


})


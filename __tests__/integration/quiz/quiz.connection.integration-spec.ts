import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { AppModule } from '../../../src/app.module';
import { CreatePairCommand } from '../../../src/features/quiz/application/use-case/create.pairs.case';
import { JoiningCoupleCommand } from '../../../src/features/quiz/application/use-case/joining.couple.case';
import { QuizQueryrepository } from '../../../src/features/quiz/infrastructure/quiz.query.repository';
import { Quizrepository } from "../../../src/features/quiz/infrastructure/quiz.repository";
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { aDescribe } from "../../utils/aDescribe";
import { AuthTestMannager } from '../../utils/auth-test-manager';
import { QuestionMamager } from '../../utils/question.test.manamger';
import { QuizMamager } from '../../utils/quiz.manager';
import { skipSettings } from "../../utils/skip-settings";










import * as request from 'supertest';
import { delay } from '../../utils/delay';





aDescribe(skipSettings.for('connectionTest'))('test create Question', () => {
    let app: INestApplication
    let quizrepository: Quizrepository;
    let commandBus: CommandBus
    let quizQueryrepository: QuizQueryrepository
    let questionMamager: QuestionMamager
    let authTestManger: AuthTestMannager;
    let quizMamager: QuizMamager

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();


        app = moduleFixture.createNestApplication()


        applyAppSettings(app);
        await app.init()
        quizrepository = app.get<Quizrepository>(Quizrepository);
        quizQueryrepository = app.get<QuizQueryrepository>(QuizQueryrepository);
        commandBus = app.get<CommandBus>(CommandBus);
        const dataSource = app.get(DataSource);
        authTestManger = new AuthTestMannager(app, dataSource);
        questionMamager = new QuestionMamager(app)
        quizMamager = new QuizMamager(app)




    })
    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });



    describe("test questions ", () => {

        it('+ creating a pair when there is no free pair', async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);


            const user = await authTestManger.findUser(userData.login)

            await commandBus.execute(new CreatePairCommand(user.userId))

            const checkPair = await quizQueryrepository.getPairFreexisting()

            expect(checkPair.data).toEqual({
                gameId: 1,
                pairCreatedDate: expect.any(String),
                playerOneId: {
                    playerId: 1,
                    score: 0,
                    status: "draft",
                    users: null
                },
                playerTwoId: null,
                questions: [],
                finishGameDate: null,
                startGameDate: null,
                status: "PendingSecondPlayer"
            })

        })

        it('+ joining an open pair ', async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }

            await questionMamager.createQuestions(5) // создание вопросов 

            await quizMamager.createPair(userData) // создание пары с вместе с user


            delay(1000) // это функция нам нужна для того, чтобы тесты проходили, так как они очень быстрые и данные начинают запрашиваться до их insert 

            const checkPair = await quizQueryrepository.getPairFreexisting() // получение свободный пары
            const userTwoData = {
                login: "fdgfdgd23",
                password: "string2323",
                email: "1e1.kn@mail.ru"
            }

            await authTestManger.registrationUser(userTwoData);
            const userTwo = await authTestManger.findUser(userTwoData.login) // создание второго user, который будет подключатсья к паре


            await commandBus.execute(new JoiningCoupleCommand(userTwo.userId, checkPair.data.gameId.toString())) // присоединение к паре 

            const pair = await quizQueryrepository.getPairById(checkPair.data.gameId.toString()) // получение пары с двуями игроками


            expect(pair.data).toEqual({
                id: 1,
                firstPlayerProgress: { answers: [], player: { id: '1', login: 'fdgfdgd' }, score: 0 },
                secondPlayerProgress: { answers: [], player: { id: '2', login: 'fdgfdgd23' }, score: 0 },
                status: 'Active',
                pairCreatedDate: expect.any(String),
                startGameDate: expect.any(String),
                finishGameDate: null,
                questions: [
                    { id: 1, body: 'aSFSgfgfgfgfgfFS' },
                    { id: 2, body: 'bSFSgfgfgfgfgfFS' },
                    { id: 3, body: 'cSFSgfgfgfgfgfFS' },
                    { id: 4, body: 'dSFSgfgfgfgfgfFS' },
                    { id: 5, body: 'eSFSgfgfgfgfgfFS' }
                ],

            })
        })





    })
})
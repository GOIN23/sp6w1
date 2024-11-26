import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { CreateQuestionCommand } from '../../../src/features/quiz/application/use-case/create.question.case';
import { DeleteQuestionCommand } from '../../../src/features/quiz/application/use-case/delete.question.case';
import { UpdateQuestionCommand } from '../../../src/features/quiz/application/use-case/update.question.case';
import { UpdateQuestionPublishedCommand } from '../../../src/features/quiz/application/use-case/update.question.publish.case';
import { QuizQueryrepository } from '../../../src/features/quiz/infrastructure/quiz.query.repository';
import { Quizrepository } from "../../../src/features/quiz/infrastructure/quiz.repository";
import { QueryQuizParamsDto } from '../../../src/features/quiz/model/input/input.question.query';
import { inputQuestionsCreateT, inputQuestionsUpdateT, publishedStatus } from "../../../src/features/quiz/type/quizType";
import { applyAppSettings } from '../../../src/settings/apply-app-setting';
import { aDescribe } from "../../utils/aDescribe";
import { QuestionMamager } from '../../utils/question.test.manamger';
import { skipSettings } from "../../utils/skip-settings";













aDescribe(skipSettings.for('questionsTest'))('test create Question', () => {
    let app: INestApplication
    let quizrepository: Quizrepository;
    let commandBus: CommandBus
    let quizQueryrepository: QuizQueryrepository
    let questionMamager: QuestionMamager

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
        questionMamager = new QuestionMamager(app)
        console.log(process.env.ENV, "testesteeets");


    })
    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });



    describe("test questions ", () => {

        it('+ create question', async () => {

            const obj: inputQuestionsCreateT = {
                body: 'DSFSgfgfgfgfgfFS',
                correctAnswers: ['DSF', 'FSDFSD'],
                createdAt: "FSFSD",
                published: false
            }

            const result = await commandBus.execute(new CreateQuestionCommand(obj.body, obj.correctAnswers))

            expect(result).toBe(1)

        })

        it('+ delete question', async () => {

            const obj: inputQuestionsCreateT = {
                body: 'DSFSgfgfgfgfgfFS',
                correctAnswers: ['DSF', 'FSDFSD'],
                createdAt: "FSFSD",
                published: false
            }

            const result = await commandBus.execute(new CreateQuestionCommand(obj.body, obj.correctAnswers))


            const question = await quizQueryrepository.getQuestionById(result)


            expect(question.data).toEqual({
                id: '1',
                body: obj.body,
                correctAnswers: [...obj.correctAnswers],
                published: obj.published,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })

            await commandBus.execute(new DeleteQuestionCommand(question.data.id))



            const questionRequestTwo = await quizQueryrepository.getQuestionById(result)

            expect(questionRequestTwo.result).toBe(false)
        })

        it('+ update path question', async () => {
            const obj: inputQuestionsCreateT = {
                body: 'DSFSgfgfgfgfgfFS',
                correctAnswers: ['DSF', 'FSDFSD'],
                createdAt: "FSFSD",
                published: false
            }


            const question = await questionMamager.createQuestion(obj)

            const objupdate: Omit<inputQuestionsUpdateT, 'updatedAt'> = {
                body: 'test222',
                correctAnswers: ['salasm', 'fdfdfd'],
            }

            console.log(question, "questionquestionquestion")

            await commandBus.execute(new UpdateQuestionCommand(objupdate.body, objupdate.correctAnswers, question.id))


            const questionRequestTwo = await quizQueryrepository.getQuestionById(question.id)

            expect(questionRequestTwo.data).toEqual({
                id: '1',
                body: objupdate.body,
                correctAnswers: [...objupdate.correctAnswers],
                published: obj.published,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            })

        })

        it('+ update publisher question', async () => {
            const obj: inputQuestionsCreateT = {
                body: 'DSFSgfgfgfgfgfFS',
                correctAnswers: ['DSF', 'FSDFSD'],
                createdAt: "FSFSD",
                published: false
            }
            const question = await questionMamager.createQuestion(obj)


            await commandBus.execute(new UpdateQuestionPublishedCommand(true, question.id))

            const questionRequestTwo = await quizQueryrepository.getQuestionById(question.id)

            expect(questionRequestTwo.data.published).toEqual(true)

        })

        it('+ get questions', async () => {

            await questionMamager.createQuestions(2)

            const queryPagination: QueryQuizParamsDto = {
                sortBy: 'createdAt',
                sortDirection: 'desc',
                pageNumber: 1,
                pageSize: 10,
                bodySearchTerm: null,
                publishedStatus: publishedStatus.all
            }

            const result = await quizQueryrepository.getQuestions(queryPagination)

            console.log(result.data.items, "resultresultresult")

            expect(result.data).toBe({
                result: true,
                errorMessage: '',
                data: {
                    pagesCount: 1,
                    page: queryPagination.pageNumber,
                    pageSize: queryPagination.pageSize,
                    totalCount: 2,
                    items: [
                        {
                            id: '2',
                            body: 'bSFSgfgfgfgfgfFS',
                            correctAnswers: ['DSbF', 'bFSDFSD'],
                            createdAt: expect.any(String),
                            published: false,
                            updatedAt: expect.any(String)
                        },
                        {
                            id: '1',
                            body: 'aSFSgfgfgfgfgfFS',
                            correctAnswers: ['DSaF', 'aFSDFSD'],
                            createdAt: expect.any(String),
                            published: false,
                            updatedAt: expect.any(String),
                        }
                    ]
                }
            })
        })
    })
})
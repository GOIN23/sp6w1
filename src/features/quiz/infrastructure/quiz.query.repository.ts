import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { PaginatorT, ResultObject } from "../../../utilit/TYPE/generalType";
import { AnswersEntity } from "../domain/answers.entityT";
import { GamesEntity } from "../domain/game.entityT";
import { GamesQuestionEntity } from "../domain/game.questions.entityT";
import { QuestionsEntity } from "../domain/questions.entityT";
import { QueryQuizParamsDto } from "../model/input/input.question.query";
import { OutputQuestionsGetById } from "../model/output/output.question.getById";

@Injectable()
export class QuizQueryrepository {
    constructor(
        @InjectRepository(QuestionsEntity) protected question: Repository<QuestionsEntity>,
        @InjectRepository(GamesEntity) protected game: Repository<GamesEntity>,
        @InjectRepository(GamesQuestionEntity) protected gamesQuestion: Repository<GamesQuestionEntity>,
        @InjectRepository(AnswersEntity) protected answers: Repository<AnswersEntity>,
        protected dataSource: DataSource
    ) { }



    async getPairById(gameId: string, userId?: string) {

        try {
            if (userId) {
                const items = await this.game
                    .createQueryBuilder('g') // Псевдоним для таблицы 'bs'
                    .where('g.gameId = :id', { id: gameId }) // Фильтруем по userId
                    .leftJoinAndSelect('g.questions', 'q')
                    .leftJoinAndSelect('q.question', 'qE')
                    .leftJoinAndSelect('g.playerOneId', 'pO')
                    .leftJoinAndSelect('g.playerTwoId', 'pT')
                    .leftJoinAndSelect('pO.answers', 'pOa')
                    .leftJoinAndSelect('pO.users', 'pOu')
                    .leftJoinAndSelect('pT.answers', 'pTa')
                    .leftJoinAndSelect('pT.users', 'pTu')
                    .andWhere('(pO.userFkId = :userId OR pT.userFkId = :userId)', { userId }) // Условие поиска по userId в playerOne или playerTwo

                    .getMany()

                return {
                    result: true,
                    errorMessage: '',
                    data: {
                        id: items[0].gameId.toString(),
                        firstPlayerProgress: {
                            answers: [...items[0].playerOneId.answers.map((el) => {
                                return {
                                    questionId: el.question.questionsId.toString(),
                                    answerStatus: el.status,
                                    addedAt: el.createdAt
                                }
                            })],
                            player: {
                                id: items[0].playerOneId.users.userId.toString(),
                                login: items[0].playerOneId.users.login
                            },
                            score: items[0].playerOneId.score
                        },
                        secondPlayerProgress: items[0].playerTwoId === null ? null : {
                            answers: [...items[0].playerTwoId.answers.map((el) => {
                                return {
                                    questionId: el.question.questionsId.toString(),
                                    answerStatus: el.status,
                                    addedAt: el.createdAt
                                }
                            })],
                            player: {
                                id: items[0].playerTwoId.users.userId.toString(),
                                login: items[0].playerTwoId.users.login
                            },
                            score: items[0].playerTwoId.score
                        },
                        questions: [
                            ...items[0].questions.map((el) => {
                                return {
                                    id: el.question.questionsId.toString(),
                                    body: el.question.body
                                }

                            })
                        ],
                        status: items[0].status,
                        pairCreatedDate: items[0].pairCreatedDate,
                        startGameDate: items[0].startGameDate,
                        finishGameDate: items[0].finishGameDate

                    }
                }
            }

            const items = await this.game
                .createQueryBuilder('g') // Псевдоним для таблицы 'bs'
                .where('g.gameId = :id', { id: gameId }) // Фильтруем по userId
                .leftJoinAndSelect('g.questions', 'q')
                .leftJoinAndSelect('q.question', 'qE')
                .leftJoinAndSelect('g.playerOneId', 'pO')
                .leftJoinAndSelect('g.playerTwoId', 'pT')
                .leftJoinAndSelect('pO.answers', 'pOa')
                .leftJoinAndSelect('pT.answers', 'pTa')
                .leftJoinAndSelect('pTa.question', 'qPta')
                .leftJoinAndSelect('pOa.question', 'qPoa')
                .leftJoinAndSelect('pO.users', 'pOu')
                .leftJoinAndSelect('pT.users', 'pTu')
                .getMany()








            return {
                result: true,
                errorMessage: '',
                data: {
                    id: items[0].gameId.toString(),
                    firstPlayerProgress: {
                        answers: [...items[0].playerOneId.answers.map((el) => {
                            return {
                                questionId: el.question.questionsId.toString(),
                                answerStatus: el.status,
                                addedAt: el.createdAt
                            }
                        })],
                        player: {
                            id: items[0].playerOneId.users.userId.toString(),
                            login: items[0].playerOneId.users.login
                        },
                        score: items[0].playerOneId.score
                    },
                    secondPlayerProgress: items[0].playerTwoId === null ? null : {
                        answers: [...items[0].playerTwoId.answers.map((el) => {
                            return {
                                questionId: el.question.questionsId.toString(),
                                answerStatus: el.status,
                                addedAt: el.createdAt
                            }
                        })],
                        player: {
                            id: items[0].playerTwoId.users.userId.toString(),
                            login: items[0].playerTwoId.users.login
                        },
                        score: items[0].playerTwoId.score
                    },
                    questions: [
                        ...items[0].questions.map((el) => {
                            return {
                                id: el.question.questionsId.toString(),
                                body: el.question.body
                            }

                        })
                    ],
                    status: items[0].status,
                    pairCreatedDate: items[0].pairCreatedDate,
                    startGameDate: items[0].startGameDate,
                    finishGameDate: items[0].finishGameDate

                }
            }



        } catch (error) {
            console.log(error, "fsdfsdfs")

            return {
                result: false,
                errorMessage: 'error when receiving blog',
                data: null
            }

        }



    }

    async getPairFreexisting() {
        const items = await this.game
            .createQueryBuilder('g') // Псевдоним для таблицы 'bs'
            .leftJoinAndSelect('g.questions', 'q')
            .leftJoinAndSelect('q.question', 'qE')
            .leftJoinAndSelect('g.playerOneId', 'pO')
            .leftJoinAndSelect('g.playerTwoId', 'pT')
            .leftJoinAndSelect('pT.users', 'ut')
            .leftJoinAndSelect('pO.users', 'uO')


            .getMany()

        const result = items.filter((el) => el.playerTwoId === null)
        const randomIndex = Math.floor(Math.random() * result.length);

        if (result.length > 0) {
            return {
                result: true,
                data: result[randomIndex],
                errorMessage: 'there is a free pair'
            }
        }

        return {
            result: false,
            data: null,
            errorMessage: 'no free pair'
        }


    }

    async getPairMycurrent(userId: string, gameId?: string) {
        try {
            debugger
            const results = await this.game
                .createQueryBuilder('g') // Псевдоним для таблицы 'bs'
                .leftJoinAndSelect('g.playerOneId', 'pO')
                .leftJoinAndSelect('g.playerTwoId', 'pT')
                .leftJoinAndSelect('pO.users', 'pOu')
                .leftJoinAndSelect('pT.users', 'pTu')
                .where('pOu.userId = :id OR pTu.userId = :id', { id: userId })
                .leftJoinAndSelect('g.questions', 'q')
                .leftJoinAndSelect('q.question', 'qE')
                .leftJoinAndSelect('pO.answers', 'pOa')
                .leftJoinAndSelect('pOa.question', 'qPo')
                .leftJoinAndSelect('pT.answers', 'pTa')
                .leftJoinAndSelect('pTa.question', 'qTa')
                .getMany()

            let items

            if (gameId) {
                items = results.filter(el => +el.gameId === +gameId)[0]
            } else {
                items = results.filter(el => el.status === 'Active' || el.status === 'PendingSecondPlayer')[0]

            }






            const data = {
                id: items.gameId.toString(),
                firstPlayerProgress: {
                    answers: items.playerOneId?.answers
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((el) => {
                            return {
                                questionId: el.question.questionsId.toString(),
                                answerStatus: el.status,
                                addedAt: el.createdAt
                            }
                        }),
                    player: {
                        id: items?.playerOneId?.users.userId.toString(),
                        login: items?.playerOneId?.users.login
                    },
                    score: items.playerOneId.score
                },
                secondPlayerProgress: items?.playerTwoId === null ? null : {
                    answers: items.playerTwoId?.answers
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

                        .map((el) => {
                            return {
                                questionId: el.question.questionsId.toString(),
                                answerStatus: el.status,
                                addedAt: el.createdAt
                            }
                        }),
                    player: {
                        id: items?.playerTwoId?.users.userId.toString(),
                        login: items?.playerTwoId?.users.login
                    },
                    score: items.playerTwoId.score
                },
                questions: items.questions
                    .sort((a, b) => a.question.questionsId - b.question.questionsId)
                    .map(el => {
                        return {
                            id: el.question.questionsId.toString(),
                            body: el.question.body
                        }
                    }),
                status: items.status,
                pairCreatedDate: items.pairCreatedDate,
                startGameDate: items.startGameDate,
                finishGameDate: items.finishGameDate

            }




            if (items) {
                return {
                    result: true,
                    errorMessage: '',
                    data: data

                }

            }

            return {
                result: false,
                errorMessage: 'error get game',
                data: null
            }
        } catch (error) {
            console.log(error)

            return {
                result: false,
                errorMessage: 'error get game',
                data: null
            }


        }



    }

    async getAnswerQuestion(gameId: string, playerId: string) {

        try {
            debugger
            const results = await this.game
                .createQueryBuilder('g')
                .where('g.gameId = :id', { id: gameId }) // Фильтруем по userId
                .leftJoinAndSelect('g.playerOneId', 'pO')
                .leftJoinAndSelect('pO.answers', 'pOa')
                .leftJoinAndSelect('g.playerTwoId', 'pT')
                .leftJoinAndSelect('pT.answers', 'pTa')
                .andWhere('(pO.playerId = :playerId OR pT.playerId = :playerId)', { playerId: playerId }) // Проверяем playerId
                .getOne()




        } catch (error) {

        }

    }
    async checkingAnswerPlayerUser(userId: number, gameId: number) {
        const items = await this.game
            .createQueryBuilder('g') // Псевдоним для таблицы 'bs'
            .where('g.gameId = :id', { id: gameId }) // Фильтруем по userId
            .leftJoinAndSelect('g.playerOneId', 'pO')
            .leftJoinAndSelect('g.playerTwoId', 'pT')
            .leftJoinAndSelect('pO.users', 'pOu')
            .leftJoinAndSelect('pT.users', 'pTu')
            .getOne()


        const result = +items.playerOneId.users.userId === +userId ? 'playerOne' : 'playerTwo'

        return result
    }

    async getQuestionById(id: string): Promise<ResultObject<OutputQuestionsGetById | null>> {

        const result = await this.question.findOne({
            where: { questionsId: +id }
        })


        if (!result) {

            return {
                result: false,
                data: null,
                errorMessage: 'no question'
            }
        }

        return {
            result: true,
            data: {
                id: result.questionsId.toString(),
                body: result.body,
                correctAnswers: [...result.correctAnswers],
                createdAt: result.createdAt,
                published: result.published,
                updatedAt: result.updatedAt
            },
            errorMessage: ''
        }



    }

    async getQuestions(query: QueryQuizParamsDto): Promise<ResultObject<PaginatorT<OutputQuestionsGetById> | null>> {

        const sortDirection: "ASC" | "DESC" = query.sortDirection === 'desc' ? 'DESC' : 'ASC';
        const bodySearchTerm = query.bodySearchTerm ? `%${query.bodySearchTerm.toLowerCase()}%` : null;
        let publishedStatus: string




        if (query.publishedStatus === 'all') {
            publishedStatus = '1=1'
        } else if (query.publishedStatus === 'published') {
            publishedStatus = 'published = true'
        } else if (query.publishedStatus === 'notPublished') {
            publishedStatus = 'published = false'
        }
        // Получаем репозиторий для работы с таблицей blogs

        try {
            // Выполняем запрос через queryBuilder
            const [items, totalCount] = await this.question
                .createQueryBuilder('q') // Псевдоним для таблицы 'bs'
                .where(bodySearchTerm ? 'LOWER(q.name) LIKE :bodySearchTerm' : '1=1', { bodySearchTerm })
                .andWhere(publishedStatus)
                .orderBy(`q.${query.sortBy} COLLATE "C"`, sortDirection) // Устанавливаем сортировку
                .skip((query.pageNumber - 1) * query.pageSize) // Пропускаем записи для пагинации
                .take(query.pageSize) // Ограничиваем размер страницы
                .getManyAndCount(); // Получаем данные и общее количество записей

            // Преобразуем данные в нужный формат
            const questionMapData: OutputQuestionsGetById[] = items.map((question: QuestionsEntity) => ({
                id: question.questionsId.toString(),
                body: question.body,
                correctAnswers: question.correctAnswers,
                createdAt: question.createdAt,
                published: question.published,
                updatedAt: question.updatedAt
            }));


            return {
                result: true,
                errorMessage: '',
                data: {
                    pagesCount: Math.ceil(totalCount / query.pageSize),
                    page: query.pageNumber,
                    pageSize: query.pageSize,
                    totalCount,
                    items: questionMapData,
                }
            }




        } catch (error) {
            console.log(error)
            return {
                result: false,
                errorMessage: `error when receiving blog: ${error}`,
                data: null
            }
        }


    }

}
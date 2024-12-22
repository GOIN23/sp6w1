import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { processPlayerAnswers } from "../../../utilit/custom/processPlayerAnswers";
import { AnswersEntity } from "../domain/answers.entityT";
import { GamesEntity } from "../domain/game.entityT";
import { GamesQuestionEntity } from "../domain/game.questions.entityT";
import { PlayersEntity } from "../domain/player.entityT";
import { QuestionsEntity } from "../domain/questions.entityT";
import { inputQuestionsCreateT, inputQuestionsUpdateT, playerstatus, statusQuiz } from "../type/quizType";


@Injectable()
export class Quizrepository {
    constructor(
        @InjectRepository(QuestionsEntity) protected question: Repository<QuestionsEntity>,
        @InjectRepository(GamesEntity) protected game: Repository<GamesEntity>,
        @InjectRepository(PlayersEntity) protected player: Repository<PlayersEntity>,
        @InjectRepository(GamesQuestionEntity) protected gamesQuestion: Repository<GamesQuestionEntity>,
        @InjectRepository(AnswersEntity) protected answersEntity: Repository<AnswersEntity>,

        @InjectDataSource() protected dataSource: DataSource,
    ) { }


    async createPair(inputPlayer: any, inputPair: any) {

        return await this.dataSource.transaction(async (manager) => {
            // Сохраняем игрок
            const playerOne = await manager.save(PlayersEntity, {
                users: inputPlayer.userId,
                score: 0,
                status: playerstatus.draft, // Предполагается, что playerstatus — это enum
            });

            // Сохраняем игру
            const newGame = await manager.save(GamesEntity, {
                pairCreatedDate: inputPair.pairCreatedDate,
                status: inputPair.status, // Предполагается, что status — это enum или строка
                playerOneId: playerOne,
            });

            const questions = await this.dataSource.getRepository(QuestionsEntity).find({
                take: 5
            });

            // Сохраняем связи между игрой и вопросами
            for (const question of questions) {
                await manager.save(GamesQuestionEntity, {
                    game: newGame, // Связь с игрой
                    question: question, // Связь с вопросом
                });
            }


            return newGame.gameId
        });




    }

    async joiningCouple(input: any) {
        await this.dataSource.transaction(async (manager) => {

            const playerTwo = await manager.save(PlayersEntity, {
                users: input.userId,
                score: 0,
                status: playerstatus.draft, // Предполагается, что playerstatus — это enum
            });



            await manager.update(GamesEntity, input.gameId, {
                startGameDate: input.startGameDate,
                playerTwoId: playerTwo,  // Обновляем игрока
                status: statusQuiz.Active
            });


        })


    }

    async sendAnswer(input: any) {

        const answers = await this.answersEntity
            .createQueryBuilder('a')
            .where('a.playerId = :playerId', { playerId: input.currentPlayerId })
            .leftJoinAndSelect('a.question', 'q')
            .getMany()

        if (answers.length === 5) {
            return {
                result: false,
                errorMessage: 'user is in active pair but has already answered to all questions',
                data: null
            }
        }

        const questions = await this.gamesQuestion.createQueryBuilder('qG')
            .where('qG.gameId = :gameId', { gameId: input.gameId })
            .leftJoinAndSelect('qG.question', 'q')
            .getMany();


        const answeredQuestionIds = answers.map(answer => answer.question.questionsId);

        // Фильтруем вопросы, исключая те, на которые уже есть ответы

        const questionNOtAnswer = questions.filter(
            question => !answeredQuestionIds.includes(question.question.questionsId)
        );

        let result: any
        let currentQuestion: any

        if (questionNOtAnswer.length === 0) {
            result = questions[0].question.correctAnswers.filter((el) => {
                return el === input.correctAnswers
            })
            currentQuestion = questions[0].question
        } else {
            result = questionNOtAnswer[0].question.correctAnswers.filter((el) => {
                return el === input.correctAnswers
            })
            currentQuestion = questionNOtAnswer[0].question
        }




        await this.dataSource.transaction(async (manager) => {
            debugger



            const iscorrectAnswer = result.length === 1 ? 'Correct' : 'Incorrect'
            await manager.save(AnswersEntity, {
                playerId: input.currentPlayerId,
                createdAt: input.createdAt,
                status: iscorrectAnswer,
                question: currentQuestion,
                body: input.correctAnswers
            })


            if (iscorrectAnswer === 'Correct') {
                await manager.update(PlayersEntity, { playerId: input.currentPlayerId }, {
                    score: +input.score + 1
                })
            }

            const answerOnePlayer = await manager
                .createQueryBuilder()
                .select("an")
                .from(AnswersEntity, "an") // Указываем таблицу и псевдоним
                .where('an.playerId = :playerOne', { playerOne: input.currentPlayerId })
                .getMany();

            const answerTwoPlayer = await manager
                .createQueryBuilder()
                .select("an")
                .from(AnswersEntity, "an") // Указываем таблицу и псевдоним
                .where('an.playerId = :playerTwo', { playerTwo: input.playerTwoId })
                .getMany();


            const lastAnswer = answerOnePlayer.length === 5 && answerTwoPlayer.length === 5



            if (questions[questions.length - 1].question.body === currentQuestion.body && lastAnswer) {
                const gamePlayerOne = await manager
                    .createQueryBuilder()
                    .select("gQ")
                    .from(GamesQuestionEntity, "gQ") // Указываем таблицу и псевдоним
                    .where('gQ.gameId = :gameId', { gameId: input.gameId })
                    .leftJoinAndSelect('gQ.question', 'q')
                    .leftJoinAndSelect('q.answers', 'a')
                    .andWhere('a.playerId = :playerId', { playerId: input.currentPlayerId })
                    .getMany();

                const gamePlayerTwo = await manager
                    .createQueryBuilder()
                    .select("gQ")
                    .from(GamesQuestionEntity, "gQ") // Указываем таблицу и псевдоним
                    .where('gQ.gameId = :gameId', { gameId: input.gameId })
                    .leftJoinAndSelect('gQ.question', 'q')
                    .leftJoinAndSelect('q.answers', 'a')
                    .andWhere('a.playerId = :playerId', { playerId: input.playerTwoId })
                    .getMany();



                const playerOneStats = processPlayerAnswers(gamePlayerOne);
                const playerTwoStats = processPlayerAnswers(gamePlayerTwo);

                let bonusPlayerOne = 0;
                let bonusPlayerTwo = 0;

                // Проверяем условия для игрока 1
                if (
                    playerOneStats.correctAnswers > 0 &&
                    playerTwoStats.lastAnswerTime &&
                    playerOneStats.lastAnswerTime < playerTwoStats.lastAnswerTime
                ) {
                    bonusPlayerOne = 1; // Дополнительный балл для игрока 1
                }

                // Проверяем условия для игрока 2
                if (
                    playerTwoStats.correctAnswers > 0 &&
                    playerOneStats.lastAnswerTime &&
                    playerTwoStats.lastAnswerTime < playerOneStats.lastAnswerTime
                ) {
                    bonusPlayerTwo = 1; // Дополнительный балл для игрока 2
                }


                const player0neScore = await manager.findOne(PlayersEntity, {
                    where: { playerId: input.currentPlayerId }
                })

                const playerTwoScore = await manager.findOne(PlayersEntity, {
                    where: { playerId: input.playerTwoId }
                })



                if (bonusPlayerOne > bonusPlayerTwo) {
                    await manager.update(PlayersEntity, { playerId: input.currentPlayerId }, {
                        score: player0neScore.score + 1
                    })
                } else {
                    await manager.update(PlayersEntity, { playerId: input.playerTwoId }, {
                        score: playerTwoScore.score + 1
                    })
                }





                const playerOne = await manager.findOne(PlayersEntity, {
                    where: { playerId: input.currentPlayerId }
                })



                const playerTwo = await manager.findOne(PlayersEntity, {

                    where: { playerId: input.playerTwoId }

                })


                await manager.update(GamesEntity, { gameId: input.gameId }, {
                    finishGameDate: new Date().toISOString(),
                    status: statusQuiz.Finished
                })


                if (playerOne.score > playerTwo.score) {
                    await manager.update(PlayersEntity, { playerId: input.currentPlayerId }, {
                        status: playerstatus.win
                    })
                } else if (playerOne.score < playerTwo.score) {
                    await manager.update(PlayersEntity, { playerId: input.playerTwoId }, {
                        status: playerstatus.win
                    })
                }




            }






        })

        return {
            result: true,
            errorMessage: '',
            data: null

        }


    }

    async createQuestion(inputQuestionsCreate: inputQuestionsCreateT): Promise<string> {

        try {

            const result = await this.question.insert({
                body: inputQuestionsCreate.body,
                correctAnswers: inputQuestionsCreate.correctAnswers,
                createdAt: inputQuestionsCreate.createdAt,
                updatedAt: null,
                published: inputQuestionsCreate.published
            })


            return result.identifiers[0].questionsId;

        } catch (error) {
            console.log(error)
        }

    }

    async deleteQuestion(id: string): Promise<void> {


        try {

            await this.question.delete({
                questionsId: +id
            })

        } catch (e) {
            console.log(e)
        }

    }

    async updateQuestion(inputQuestionsUpdateT: inputQuestionsUpdateT, questionId: string): Promise<void> {
        try {
            await this.question
                .createQueryBuilder()
                .update(QuestionsEntity)
                .set({ body: inputQuestionsUpdateT.body, correctAnswers: inputQuestionsUpdateT.correctAnswers, updatedAt: inputQuestionsUpdateT.updatedAt })
                .where('questionsId = :questionId', { questionId })
                .execute();

        } catch (error) {
            console.error(error);
        }
    }

    async updateQuestionPublish(published: boolean, questionId: string): Promise<void> {
        try {
            await this.question
                .createQueryBuilder()
                .update(QuestionsEntity)
                .set({ published: published, updatedAt: new Date().toISOString() })
                .where('questionsId = :questionId', { questionId })
                .execute();

        } catch (error) {
            console.error(error);
        }
    }



}
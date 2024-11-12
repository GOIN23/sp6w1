import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuestionsEntity } from "../domain/questions.entityT";
import { inputQuestionsCreateT, inputQuestionsUpdateT } from "../type/quizType";

QuestionsEntity
@Injectable()
export class Quizrepository {
    constructor(
        @InjectRepository(QuestionsEntity) protected question: Repository<QuestionsEntity>,
    ) { }


    async createPair() {


    }

    async createQuestion(inputQuestionsCreate: inputQuestionsCreateT): Promise<string> {

        try {

            const result = await this.question.insert({
                body: inputQuestionsCreate.body,
                correctAnswers: inputQuestionsCreate.correctAnswers,
                createdAt: inputQuestionsCreate.createdAt,
                updatedAt: inputQuestionsCreate.createdAt,
                published: inputQuestionsCreate.published
            })


            return result.identifiers[0].id;

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
                .set({ published: published })
                .where('questionsId = :questionId', { questionId })
                .execute();

        } catch (error) {
            console.error(error);
        }
    }



}
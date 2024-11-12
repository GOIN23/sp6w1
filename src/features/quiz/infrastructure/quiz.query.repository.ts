import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatorT, ResultObject } from "../../../utilit/TYPE/generalType";
import { QuestionsEntity } from "../domain/questions.entityT";
import { QueryQuizParamsDto } from "../model/input/input.question.query";
import { OutputQuestionsGetById } from "../model/output/output.question.getById";

@Injectable()
export class QuizQueryrepository {
    constructor(
        @InjectRepository(QuestionsEntity) protected question: Repository<QuestionsEntity>,



    ) { }



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
                correctAnswers: result.correctAnswers,
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
                .where(bodySearchTerm ? 'LOWER(b.name) LIKE :bodySearchTerm' : '1=1', { bodySearchTerm })
                .andWhere(publishedStatus)
                .orderBy(`b.${query.sortBy} COLLATE "C"`, sortDirection) // Устанавливаем сортировку
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
            return {
                result: false,
                errorMessage: `error when receiving blog: ${error}`,
                data: null
            }
        }


    }

}
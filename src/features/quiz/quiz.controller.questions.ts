import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AuthGuard } from "../../utilit/guards/basic-auth-guards";
import { CreateQuestionCommand } from "./application/use-case/create.question.case";
import { DeleteQuestionCommand } from "./application/use-case/delete.question.case";
import { UpdateQuestionCommand } from "./application/use-case/update.question.case";
import { UpdateQuestionPublishedCommand } from "./application/use-case/update.question.publish.case";
import { QuizQueryrepository } from "./infrastructure/quiz.query.repository";
import { InputQuestionCreate } from "./model/input/input.question.create";
import { QueryQuizParamsDto } from "./model/input/input.question.query";
import { InputQuestionUpdatePublish } from "./model/input/input.question.update.publish";
import { DefaultValuesPipeQuiz } from "./util/pipe/pipe.quiz.query";








@Controller('quiz/questions')
export class QuizQuestionsController {
    constructor(private commandBuse: CommandBus, private quizQueryRepository: QuizQueryrepository) { }



    @Get("")
    @UseGuards(AuthGuard)
    @HttpCode(200)
    async getBlogs(@Query(new DefaultValuesPipeQuiz()) qurePagination: QueryQuizParamsDto) {
        const questions = await this.quizQueryRepository.getQuestions(qurePagination)


        return questions.data
    }


    @Post("")
    @UseGuards(AuthGuard)
    async createQuestion(@Body() questionInput: InputQuestionCreate) {
        const questionId: string = await this.commandBuse.execute(new CreateQuestionCommand(questionInput.body, questionInput.correctAnswers))

        return (await this.quizQueryRepository.getQuestionById(questionId)).data
    }

    @Delete("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async deletQuestionById(@Param("id") id: string) {

        const question = await this.quizQueryRepository.getQuestionById(id)

        if (!question.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.commandBuse.execute(new DeleteQuestionCommand(id))
    }

    @Put("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async putQuestionById(@Param("id") id: string, @Body() questionInput: InputQuestionCreate) {

        const question = await this.quizQueryRepository.getQuestionById(id)

        if (!question.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        if (!questionInput.correctAnswers[0] && question.data.published) {
            throw new HttpException({
                message: [
                    { message: 'correctAnswers not found', field: 'correctAnswers' },
                ]
            }, HttpStatus.BAD_REQUEST);
        }



        await this.commandBuse.execute(new UpdateQuestionCommand(questionInput.body, questionInput.correctAnswers, id))



    }

    @Put("/:id/publish")
    @UseGuards(AuthGuard)
    @HttpCode(204)
    async putQuestionByIdPublish(@Param("id") id: string, @Body() questionInput: InputQuestionUpdatePublish) {

        const question = await this.quizQueryRepository.getQuestionById(id)

        if (!question.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }


        await this.commandBuse.execute(new UpdateQuestionPublishedCommand(questionInput.published, id))


    }


}






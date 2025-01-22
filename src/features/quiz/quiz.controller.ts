import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Request, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuardPassport } from "../../utilit/strategies/jwt-auth-strategies";
import { CreatePairCommand } from "./application/use-case/create.pairs.case";
import { JoiningCoupleCommand } from "./application/use-case/joining.couple.case";
import { SendAnswersCommand } from "./application/use-case/send.answers.case";
import { QuizQueryrepository } from "./infrastructure/quiz.query.repository";




@Controller('pair-game-quiz/pairs')
export class QuizController {
    constructor(private commandBuse: CommandBus, protected quizQueryrepository: QuizQueryrepository) { }
    @Post("connection")
    @UseGuards(JwtAuthGuardPassport)
    @HttpCode(200)
    async connection(@Request() req: any) {

        const checkPair = await this.quizQueryrepository.getPairFreexisting()

        const checkCurrentPairUser = await this.quizQueryrepository.getPairMycurrent(req.user.userId)



        if (checkPair?.data?.playerTwoId?.users?.userId === req.user.userId || checkPair?.data?.playerOneId?.users?.userId === +req.user.userId || checkCurrentPairUser.result) {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);
        }


        if (checkPair.result) {
            await this.commandBuse.execute(new JoiningCoupleCommand(req.user.userId, checkPair.data.gameId.toString()))
            const pair = await this.quizQueryrepository.getPairById(checkPair.data.gameId.toString())

            return pair.data
        }

        const gameId: number = await this.commandBuse.execute(new CreatePairCommand(req.user.userId))

        const pair = await this.quizQueryrepository.getPairById(gameId.toString())

        pair.data.secondPlayerProgress === null ? pair.data.questions = null : ''

        return pair.data
    }

    @Get("my-current")
    @UseGuards(JwtAuthGuardPassport)
    @HttpCode(200)
    async getMysCurrent(@Request() req: any) {


        const result2 = await this.quizQueryrepository.getPairMycurrent(req.user.userId)

        if (!result2.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        if (result2.data.firstPlayerProgress.player.login !== req.user.login && result2.data.secondPlayerProgress.player.login !== req.user.login) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        result2.data.secondPlayerProgress === null ? result2.data.questions = null : ''




        return result2.data

    }

    @Get("/:id")
    @UseGuards(JwtAuthGuardPassport)
    @HttpCode(200)
    async getPairbyId(@Param("id") id: string, @Request() req: any) {

        if (isNaN(+id)) {
            throw new HttpException({
                message: [
                    { message: 'id incorect', field: 'id' },
                ]
            }, HttpStatus.BAD_REQUEST);

        }


        const isPair = await this.quizQueryrepository.getPairById(id)


        if (!isPair.result) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // const pair = await this.quizQueryrepository.getPairMycurrent(req.user.userId)

        if (isPair.data.firstPlayerProgress?.player?.login !== req.user.login && isPair.data.secondPlayerProgress?.player?.login !== req.user.login) {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);

        }


        isPair.data.secondPlayerProgress === null ? isPair.data.questions = null : ''



        return isPair.data
    }

    @Post("my-current/answers")
    @UseGuards(JwtAuthGuardPassport)
    @HttpCode(200)
    async getMyCurrentAnswers(@Request() req: any, @Body() answer: string) {
        debugger


        const result = await this.quizQueryrepository.getPairMycurrent(req.user.userId)

        if (!result.result || result.data.secondPlayerProgress === null) {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);

        }


        if (result.data.firstPlayerProgress?.player?.login !== req.user.login && result.data.secondPlayerProgress?.player?.login !== req.user.login) {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);

        }

        const checPlayerUser = await this.quizQueryrepository.checkingAnswerPlayerUser(req.user.userId, +result.data.id)
        let res: any

        if (checPlayerUser === 'playerOne') {
            res = { playerId: result.data.firstPlayerProgress.player.id, scoreCurrentPlayer: result.data.firstPlayerProgress.score }
        } else {
            res = { playerId: result.data.secondPlayerProgress.player.id, scoreCurrentPlayer: result.data.secondPlayerProgress.score }
        }

        // const checPlayerUser = await this.quizQueryrepository.checkingAnswerPlayerUser(req.user.userId, result.data.id) === 'playerOne' ? { playerId: result.data.firstPlayerProgress.player.id, scoreCurrentPlayer: result.data.firstPlayerProgress.score } : { playerId: result.data.secondPlayerProgress.player.id, scoreCurrentPlayer: result.data.secondPlayerProgress.score } // здесь определяем какой это игрок

        const twoPlayer = checPlayerUser === 'playerOne'
            ? { playerId: result.data.secondPlayerProgress.player.id, scoreCurrentPlayer: result.data.secondPlayerProgress.score }
            : { playerId: result.data.firstPlayerProgress.player.id, scoreCurrentPlayer: result.data.firstPlayerProgress.score }


        const obj = await this.commandBuse.execute(new SendAnswersCommand(result.data.id.toString(), res.playerId, answer, res.scoreCurrentPlayer.toString(), twoPlayer.playerId))


        if (obj.errorMessage === 'user is in active pair but has already answered to all questions') {
            throw new HttpException('User not found', HttpStatus.FORBIDDEN);
        }




        const resultRes = await this.quizQueryrepository.getPairMycurrent(req.user.userId, result.data.id)






        const bodyRespo = {
            questionId: resultRes.data?.firstPlayerProgress?.player.id === res.playerId
                ? resultRes.data?.firstPlayerProgress.answers[resultRes.data?.firstPlayerProgress.answers.length - 1].questionId
                : resultRes.data?.secondPlayerProgress?.answers[resultRes.data?.secondPlayerProgress?.answers.length - 1].questionId,
            answerStatus: resultRes.data?.firstPlayerProgress.player.id === res.playerId
                ? resultRes.data?.firstPlayerProgress.answers[resultRes.data?.firstPlayerProgress.answers.length - 1].answerStatus
                : resultRes.data?.secondPlayerProgress?.answers[resultRes.data?.secondPlayerProgress?.answers.length - 1].answerStatus,
            addedAt: resultRes.data?.firstPlayerProgress.player.id === res.playerId
                ? resultRes.data?.firstPlayerProgress.answers[resultRes.data?.firstPlayerProgress.answers.length - 1].addedAt
                : resultRes.data?.secondPlayerProgress?.answers[resultRes.data?.secondPlayerProgress?.answers.length - 1].addedAt,


        }

        console.log(bodyRespo, "bodyRespobodyRespobodyRespobodyRespo")

        return bodyRespo

    }

}
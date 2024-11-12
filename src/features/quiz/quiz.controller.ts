import { Controller, HttpCode, Post, Request, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuardPassport } from "../../utilit/strategies/jwt-auth-strategies";




@Controller('pair-game-quiz/pairs')
export class QuizController {
    constructor(private commandBuse: CommandBus) { }
    @Post("connection")
    @UseGuards(JwtAuthGuardPassport)// Это единсвтенное место где я использую passportJwt
    @HttpCode(201)
    async connection(@Request() req: any) {
        // let resultGetgame = false

        // if (resultGetgame) {

        // }


        // await this.commandBuse.execute(new CreatePairCommand(req.user.userId))








    }









}
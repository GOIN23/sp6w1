import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { UserCreateModel } from "./models/input/create-user.input.model";
import { UserOutputModel } from "./models/output/user.output.model";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { qureT } from "src/utilit/TYPE/generalType";
import { DefaultValuesPipeUser, QueryParamsDto } from "src/utilit/dto/dto.query.user";
import { AuthGuard } from "src/utilit/guards/basic-auth-guards";



@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(protected usersService: UsersService, protected usersQueryRepository: UsersQueryRepository,) { }

    @Post()
    @HttpCode(201)
    async createUser(@Body() createModel: UserCreateModel): Promise<UserOutputModel> {
        const result = await this.usersService.creatUser(createModel.email, createModel.login, createModel.password)

        return await this.usersQueryRepository.getById(result);
    }


    @Get()
    @UsePipes(new DefaultValuesPipeUser()) // Использование ValidationPipe
    @HttpCode(200)
    async geteUser(@Query() qurePagination: QueryParamsDto) {
        const users = await this.usersQueryRepository.getUsers(qurePagination)

        return users

    }


    @Delete("/:id")
    @HttpCode(204)
    async deleteUser(@Param("id") id: string) {
        const user = await this.usersService.findUser(id)
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.usersService.deletUser(id)
    }

}



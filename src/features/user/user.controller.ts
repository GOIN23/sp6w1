import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { UserCreateModel } from "./models/input/create-user.input.model";
import { UserOutputModel } from "./models/output/user.output.model";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { DefaultValuesPipeUser, QueryParamsDto } from "../../utilit/dto/dto.query.user";
import { AuthGuard } from "../../utilit/guards/basic-auth-guards";
import { CommandBus, EventBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "./application/use-case/create-use-case";
import { UserCreatedEvent } from "./application/event/kill";
import { DataSource } from "typeorm";
import { UsersSqlQueryRepository } from "./infrastructure/users.sql.query.repository";

// @InjectDataSource() protected dataSource: DataSource

@Controller('sa/users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(protected usersService: UsersService, protected usersQueryRepository: UsersQueryRepository, private commandBuse: CommandBus, protected usersSqlQueryRepository: UsersSqlQueryRepository, private eventBus: EventBus, protected dataSource: DataSource) { }

    @Post()
    @HttpCode(201)
    async createUser(@Body() createModel: UserCreateModel): Promise<UserOutputModel> {
        const userId = await this.commandBuse.execute(new CreateUserCommand(createModel.login, createModel.email, createModel.password))

        this.eventBus.publish(new UserCreatedEvent(userId))
        return await this.usersSqlQueryRepository.getById(userId);
    }


    @Get()
    @UsePipes(new DefaultValuesPipeUser()) // Использование ValidationPipe
    @HttpCode(200)
    async getUsers(@Query() qurePagination: QueryParamsDto) {
        const users = await this.usersSqlQueryRepository.getUsers(qurePagination)

        return users

    }


    @Get("/:id")
    @HttpCode(200)
    async geteUser(@Param("id") id: string) {
        const users = await this.usersSqlQueryRepository.getById(id)

        return users

    }



    @Delete("/:id")
    @HttpCode(204)
    async deleteUser(@Param("id") id: string) {
        const user = await this.usersSqlQueryRepository.getById(id)
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        }

        await this.usersService.deletUser(id)
    }


}



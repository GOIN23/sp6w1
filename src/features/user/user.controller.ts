import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes } from "@nestjs/common";
import { CommandBus, EventBus } from "@nestjs/cqrs";
import { DataSource } from "typeorm";
import { DefaultValuesPipeUser, QueryParamsDto } from "../../utilit/dto/dto.query.user";
import { AuthGuard } from "../../utilit/guards/basic-auth-guards";
import { UserCreatedEvent } from "./application/event/kill";
import { CreateUserCommand } from "./application/use-case/create-use-case";
import { UsersService } from "./application/users.service";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { UsersSqlQueryRepository } from "./infrastructure/users.sql.query.repository";
import { UserCreateModel } from "./models/input/create-user.input.model";
import { UserOutputModel } from "./models/output/user.output.model";

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



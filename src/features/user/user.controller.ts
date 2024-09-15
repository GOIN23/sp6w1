import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { UserCreateModel } from "./models/input/create-user.input.model";
import { UserOutputModel } from "./models/output/user.output.model";
import { UsersQueryRepository } from "./infrastructure/users.query-repository";
import { qureT } from "src/utilit/TYPE/generalType";
import { DefaultValuesPipeUser, QueryParamsDto } from "../../utilit/dto/dto.query.user";
import { AuthGuard } from "../../utilit/guards/basic-auth-guards";
import { CommandBus, EventBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "./application/use-case/create-use-case";
import { UserCreatedEvent } from "./application/event/kill";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";

// @InjectDataSource() protected dataSource: DataSource

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(protected usersService: UsersService, protected usersQueryRepository: UsersQueryRepository, private commandBuse: CommandBus, private eventBus: EventBus, protected dataSource: DataSource) { }

    @Post()
    @HttpCode(201)
    async createUser(@Body() createModel: UserCreateModel): Promise<UserOutputModel> {
        const userId = await this.commandBuse.execute(new CreateUserCommand(createModel.login, createModel.email, createModel.password))

        this.eventBus.publish(new UserCreatedEvent(userId))
        return await this.usersQueryRepository.getById(userId);
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


    @Get("test")
    async testPost() {

        return this.dataSource.query(
            `
        SELECT order_id, order_date, last_name
FROM orders
LEFT JOIN employees ON orders.employee_id = employees.employee_id
LIMIT 5
            `
        )
    }
}



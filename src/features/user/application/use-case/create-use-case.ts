import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";
import * as bcrypt from 'bcrypt';
import { User } from "../../domain/createdBy-user-Admin.entity";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { EmailAdapter } from "../../../auth/application/emai-Adapter";
import { UsersSqlRepository } from "../../infrastructure/users.sql.repository";


export class CreateUserCommand {
    constructor(
        public login: string,
        public email: string,
        public password: string,

    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(private readonly usersRepository: UsersRepository, protected emailAdapter: EmailAdapter, protected userSqlRepository: UsersSqlRepository) { }

    async execute(dtoInputDate: CreateUserCommand) {
        const passwordSalt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(dtoInputDate.password, passwordSalt);

        const newUser: User = {
            createdAt: new Date().toISOString(),
            email: dtoInputDate.email,
            login: dtoInputDate.login,
            passwordHash: hash,
            passwordSalt: passwordSalt,
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }),
                isConfirmed: false
            }
        }

        // const userId = await this.usersRepository.creatInDbUser(newUser)



        this.emailAdapter.sendEmail(newUser.emailConfirmation.confirmationCode, newUser.email);



        try {
            const userId2 = await this.userSqlRepository.creatInDbUser(newUser)
            return userId2
        } catch (error) {
            console.log(error)

        }


    }
}

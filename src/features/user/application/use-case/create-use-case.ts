import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";
import * as bcrypt from 'bcrypt';
import { User } from "../../domain/createdBy-user-Admin.entity";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { EmailAdapter } from "src/features/auth/application/emai-Adapter";


export class CreateUserCommand {
    constructor(
        public login: string,
        public email: string,
        public password: string,

    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(private readonly usersRepository: UsersRepository, protected emailAdapter: EmailAdapter) { }

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

        const userId = await this.usersRepository.creatInDbUser(newUser)

        this.emailAdapter.sendEmail(newUser.emailConfirmation.confirmationCode, newUser.email);

        return userId

    }
}

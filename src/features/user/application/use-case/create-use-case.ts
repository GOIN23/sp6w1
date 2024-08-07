import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";
import { InterlayerNotice } from "src/utilit/interLayer/inter-layer";
import { UserCreatedEvent } from "../events/user-created-event";

export class CreateUserCommand {
    constructor(
        public name: string,
        public email?: string,
    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
    implements
    ICommandHandler<CreateUserCommand, InterlayerNotice<CreateUserResultData>> {
    constructor(
        private readonly usersRepository: UsersRepository,
        // шина ивентов
        private readonly eventBus: EventBus,
    ) { }

    async execute(
        command: CreateUserCommand,
    ): Promise<InterlayerNotice<CreateUserResultData>> {
        const { name, email } = command;
        const notice = new InterlayerNotice<CreateUserResultData>();


        // Вариант валидации на уровне BLL
        if (email === 'admin@site.com') {
            notice.addError('Email not valid', 'email');
            return notice;
        }

        const result = await this.usersRepository.creatInDbUser(user);

        // В шину событий публикуем событие UserCreatedEvent
        this.eventBus.publish(new UserCreatedEvent(name));

        notice.addData({ userId: result.id });

        return notice;
    }
}

export type CreateUserResultData = {
    userId: string;
};
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../infrastructure/users.repository";



export class GetUser {
    constructor(
        public userId: string,
    ) { }
}

@QueryHandler(GetUser)
export class GetUserUseCase implements IQueryHandler<GetUser> {
    constructor(private readonly usersRepository: UsersRepository) { }

    async execute(classId: GetUser) {
        return await this.usersRepository.findinDbUser(classId.userId)

    }
}

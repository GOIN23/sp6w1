

import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { EmailAdapter } from "../../auth/application/emai-Adapter";
import { User } from "../domain/createdBy-user-Admin.entity";
import { UsersRepository } from "../infrastructure/users.repository";
import { UsersSqlRepository } from "../infrastructure/users.sql.repository";




// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository, protected emailAdapter: EmailAdapter, protected usersSqlRepository: UsersSqlRepository) { }

    async creatUser(email: string, login: string, password: string): Promise<string> {

        const passwordSalt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, passwordSalt);

        const newUser: User = {
            createdAt: new Date().toISOString(),
            email: email,
            login: login,
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

        try {
            await this.emailAdapter.sendEmail(newUser.emailConfirmation.confirmationCode, newUser.email);
        } catch (error) {
            console.log(error);
        }

        return userId
    }

    async findUser(id: string) {
        return await this.usersRepository.findinDbUser(id)
    }

    async deletUser(id: string) {
        await this.usersSqlRepository.deletUser(id)
    }
}
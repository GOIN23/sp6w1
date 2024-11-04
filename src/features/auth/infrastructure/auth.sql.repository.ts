
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersSqlRepository } from '../../user/infrastructure/users.sql.repository';
import { RecoveryPassword } from '../domain/recovery.password.code.entity';
import { SesionEntity } from '../domain/sesion.auth.entity';


@Injectable()
export class UsersAuthSqlRepository {
    constructor(protected dataSource: DataSource, @InjectRepository(SesionEntity)
    protected sesions: Repository<SesionEntity>, protected usersSqlRepository: UsersSqlRepository, @InjectRepository(RecoveryPassword)
        protected recoveryPassword: Repository<RecoveryPassword>) { }


    // async findUsers(id: string | undefined) {
    //     const result = await this.userModel.findOne({ _id: id });
    //     if (!result) {
    //         return null;
    //     }
    //     return result;
    // }

    async findBlogOrEmail(loginOrEmail: string): Promise<any | null> {




        const result = await this.usersSqlRepository.findBlogOrEmail(loginOrEmail)
        if (!result) {
            return null
        }

        return result



    }


    async postPasswordRecoveryCode(code: string, email: string) {
        try {
            await this.recoveryPassword.insert({
                code: code,
                email: email
            })

        } catch (error) {
            console.error('Error updating session:', error);
        }

    }

    async checkPasswordRecoveryCode(code: string) {


        try {
            const res = await this.recoveryPassword.findOne({
                where: { code: code }
            })

            return res

        } catch (error) {
            console.log(error)
        }
    }

    async updatePassword(email: string, newPasswordHash: string, newPasswordSalt: string): Promise<void> {
        const queryuUserTable = `
        UPDATE users
        SET password_hash = $1,
            password_salt = $2
        WHERE email = $3;
    `;

        const parameter = [newPasswordHash, newPasswordSalt, email]

        try {
            await this.dataSource.query(queryuUserTable, parameter)

        } catch (error) {
            console.log(error)
        }


    }

    async addSesionUser(userSession: any) {
        debugger

        const result = await this.sesions.insert({
            deviceId: userSession.deviceId,
            ip: userSession.ip,
            lastActiveDate: userSession.lastActiveDate,
            title: userSession.title,
            user: userSession.userId
        })
        return result.identifiers[0].deviceId
    }


    async findRottenSessions(userId: number, deviceId: string) {


        try {
            const session = await this.sesions.createQueryBuilder('s') // Создаем QueryBuilder для SessionEntity
                .where('s.deviceId = :deviceId', { deviceId }) // Условия для фильтрации по deviceId
                .andWhere('s.userIdFk = :userId', { userId }) // Условия для фильтрации по userId
                .getOne(); // Получаем одну запись или null

            return session; // Вернуть найденную сессию или null
        } catch (error) {
            console.log(error); // Логируем ошибку
            return null; // Возвращаем null в случае ошибки
        }


    }

    async completelyRemoveSesion(deviceId: string, userId: string) {

        await this.sesions.delete({ deviceId: deviceId, user: { userId: +userId } })
    }

    async updateSesionUser(iat: string, userId: string, diveceid: string) {


        try {
            await this.sesions
                .createQueryBuilder()
                .update(SesionEntity)
                .set({ lastActiveDate: iat }) // Устанавливаем новое значение для lastActiveDate
                .where('"userIdFk" = :userId', { userId })
                .andWhere('"deviceId" = :diveceid', { diveceid })
                .execute();
        } catch (error) {
            console.error('Error updating session:', error);
        }


    }
    async getSesions(userId: string) {



        try {
            const sessions = await this.sesions
                .createQueryBuilder('s') // Создаем QueryBuilder для Devicessesions
                .where('s.userIdFk = :userId', { userId }) // Условие фильтрации по userId
                .getMany(); // Получаем все записи

            // Преобразуем данные сессий
            const mappedSessions = sessions.map((session) => {
                return {
                    deviceId: session.deviceId,
                    ip: session.ip,
                    lastActiveDate: new Date(+session.lastActiveDate), // Убедитесь, что формат времени правильный
                    title: session.title,
                };
            });

            return mappedSessions;

        } catch (error) {
            console.error('Error fetching sessions:', error);
        }




    }
    async getSesionsId(deviceId: string) {


        try {
            return await this.sesions.findOne({
                where: { deviceId: deviceId }, // Используем `where` для указания условия поиска
            })

        } catch (error) {
            console.log(error)
        }
    }

    async deleteSesions(deviceId: string, userId: string) {
        try {
            await this.sesions
                .createQueryBuilder()
                .delete() // Указываем, что хотим удалить записи
                .from(SesionEntity) // Из какой сущности
                .where('deviceId <> :deviceId', { deviceId }) // Условие для исключения
                .andWhere('userIdFk = :userId', { userId }) // Условие для фильтрации по userId
                .execute(); // Выполняем запрос
        } catch (error) {
            console.log('Error deleting sessions:', error);
        }


    }
    async deleteSesionsId(deviceId: string) {
        try {
            await this.sesions.delete({ deviceId: deviceId })

        } catch (error) {
            console.log(error)
        }
    }
}

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserCreateModel } from '../../src/features/user/models/input/create-user.input.model';

export const ADMIN_AUTH = "admin:qwerty"; // get from SETTINGS
const buff2 = Buffer.from(ADMIN_AUTH, "utf8");
let codedAuth: string = buff2.toString("base64");

export class UsersTestManager {
  constructor(protected app: INestApplication) { }
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.login).toBe(responseModel.login);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: UserCreateModel, status: number, authenticatioInformation: any, expextResult?: any) {
    if (expextResult) {
      return request(this.app.getHttpServer())
        .post('/api/users')
        .set(authenticatioInformation)
        .send(createModel)
        .expect(status, expextResult);
    }
    return request(this.app.getHttpServer())
      .post('/api/users')
      .set(authenticatioInformation)
      .send(createModel)
      .expect(status);
  }

  async getUsers(expextResult: any, status: number, authenticatioInformation: any) {

    return request(this.app.getHttpServer())
      .get('/api/users')
      .set(authenticatioInformation)
      .expect(status, expextResult)
      ;
  }

  async createUsers(counter: number) {
    const alphabet = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g',
      'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't', 'u',
      'v', 'w', 'x', 'y', 'z'
    ];

    for (let a = 0; a < counter; a++) {
      await request(this.app.getHttpServer())
        .post('/api/users')
        .set({ Authorization: "Basic " + codedAuth })
        .send({
          email: `4e${a}.kn@mail.ru`,
          login: `${alphabet[a]}dsm${a}mma`,
          password: "123123123"
        })
    }

    return request(this.app.getHttpServer())
      .get("/api/users")
      .set({ Authorization: "Basic " + codedAuth })


  }

  async comparisonQueriesByQuery(query: any, expextResult: any) {
    await request(this.app.getHttpServer())
      .get("/api/users")
      .set({ Authorization: "Basic " + codedAuth })
      .query(query)
      .expect(expextResult);

  }

  async deleteUser(id: number, status: number) {
    await request(this.app.getHttpServer())
      .delete(`/api/users/${id}`)
      .set({ Authorization: "Basic " + codedAuth })
      .expect(status);
  }


  static async login(
    app: INestApplication,
    login: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    // await request(app.getHttpServer())
    //   .post('/login')
    //   .send({ login, password })
    //   .expect(200);

    return { accessToken: 'qwerty.access.token' };
  }
}

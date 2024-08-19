import { INestApplication } from '@nestjs/common';
import { UserCreateModel } from 'src/features/user/models/input/create-user.input.model';
import request from 'supertest';

export const ADMIN_AUTH = "admin:qwerty"; // get from SETTINGS
const buff2 = Buffer.from(ADMIN_AUTH, "utf8");
let codedAuth: string = buff2.toString("base64");

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) { }
  // можно выносить некоторые проверки в отдельные методы для лучшей читаемости тестов
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.login).toBe(responseModel.login);
    expect(createModel.email).toBe(responseModel.email);
  }

  async createUser(createModel: UserCreateModel) {
    return request(this.app.getHttpServer())
      .post('/api/users')
      .set({ Authorization: "Basic " + codedAuth })
      .send(createModel)
      .expect(200);
  }

  async updateUser(adminAccessToken: string, updateModel: any) {
    return request(this.app.getHttpServer())
      .put('/api/users')
      .auth(adminAccessToken, {
        type: 'bearer',
      })
      .send(updateModel)
      .expect(204);
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

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { EmailAdapter } from "../src/features/auth/application/emai-Adapter";
import { applyAppSettings } from "../src/settings/apply-app-setting";
import { EmailAdapterMock } from "./mock/email.adapter.mock";
import { aDescribe } from "./utils/aDescribe";
import { AuthTestMannager } from "./utils/auth-test-manager";
import { skipSettings } from "./utils/skip-settings";





aDescribe(skipSettings.for('authTest'))("user test", () => {
    let app: INestApplication;
    let authTestManger: AuthTestMannager;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideProvider(EmailAdapter)
            .useClass(EmailAdapterMock)
            .compile();


        app = moduleFixture.createNestApplication()


        // Применяем все настройки приложения (pipes, guards, filters, ...)
        applyAppSettings(app);
        await app.init();
        const dataSource = app.get(DataSource);
        authTestManger = new AuthTestMannager(app, dataSource);
        console.log(process.env.ENV, "testesteeets");


    });

    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });

    afterAll(async () => {
        await app.close();
    });

    it("+ check registration auth (POST api/auth/registration) successful request", () => {
        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }

        request(app.getHttpServer())
            .post('/api/auth/registration')
            .send(userData)
            .expect(204)
    })

    it("- check registration auth (POST api/auth/registration) bad request", async () => {
        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }

        request(app.getHttpServer())
            .post('/api/auth/registration')
            .send(userData)
            .expect(204)


        request(app.getHttpServer())
            .post('/api/auth/registration')
            .send(userData)
            .expect(400)//with such email or login the user is already registered




    })

    it("+ check login auth (POST api/auth/login) successful request", async () => {
        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }
        await authTestManger.registrationUser(userData)

        const result = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                loginOrEmail: userData.login,
                password: userData.password
            })
            .expect(200)


        expect(result.body).toHaveProperty("accessToken")
        const cookies = result.headers['set-cookie'];
        expect(cookies[0]).toContain('refreshToken');


    })

    it("- check login auth (POST api/auth/login) bad request", async () => {
        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }
        await authTestManger.registrationUser(userData)

        await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                loginOrEmail: userData.login,
                password: "invalid password"
            })
            .expect(401)//If the password or login is wrong

    })

    it("- check logout auth (POST api/auth/logout) successful request", async () => {
        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }
        await authTestManger.registrationUser(userData)

        const result = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                loginOrEmail: userData.login,
                password: userData.password
            })
            .expect(200)
        const cookies = result.headers['set-cookie']



        await request(app.getHttpServer())
            .post('/api/auth/logout')
            .set('Cookie', cookies)
            .expect(204)


    })


})


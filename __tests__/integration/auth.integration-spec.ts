import { HttpStatus, INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { DataSource } from "typeorm";
import { AppModule } from "../../src/app.module";
import { UsersAuthService } from "../../src/features/auth/application/auth-service";
import { EmailAdapter } from "../../src/features/auth/application/emai-Adapter";
import { UsersAuthSqlRepository } from "../../src/features/auth/infrastructure/auth.sql.repository";
import { applyAppSettings } from "../../src/settings/apply-app-setting";
import { EmailAdapterMock } from "../mock/email.adapter.mock";
import { aDescribe } from "../utils/aDescribe";
import { AuthTestMannager } from "../utils/auth-test-manager";
import { delay } from "../utils/delay";
import { skipSettings } from "../utils/skip-settings";







aDescribe(skipSettings.for('authTest'))("user test", () => {
    let app: INestApplication;
    let authTestManger: AuthTestMannager;
    let emailAdapter: EmailAdapterMock
    let usersAuthSqlRepository: UsersAuthSqlRepository
    let authService: UsersAuthService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).overrideProvider(EmailAdapter)
            .useClass(EmailAdapterMock)
            .compile();


        app = moduleFixture.createNestApplication()


        // Применяем все настройки приловвжения (pipes, guards, filters, ...)
        applyAppSettings(app);
        await app.init();
        const dataSource = app.get(DataSource);
        authTestManger = new AuthTestMannager(app, dataSource);
        emailAdapter = app.get(EmailAdapter)
        usersAuthSqlRepository = app.get(UsersAuthSqlRepository)
        authService = app.get(UsersAuthService)
        console.log(process.env.ENV, "testesteeets");



    });
    beforeEach(async () => {
        jest.clearAllMocks();
    })

    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });

    afterAll(async () => {
        await app.close();
    })

    describe("authentication", () => {

        it("+ registration correct api/auth/registration", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);
            console.log(emailAdapter, "emailAdapteremailAdapteremailAdapteremailAdapter")

            expect(emailAdapter.sendEmail).toHaveBeenCalled();
            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1);
        });
        it("- should not register user twice api/auth/registration", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            await request(app.getHttpServer())
                .post(`/api/auth/registration`)
                .send(userData)
                .expect({
                    errorsMessages: [
                        {
                            field: "login",
                            message: "",
                        },
                        {
                            field: "email",
                            message: "",
                        },
                    ],
                });
        });
        it("+ verification confirmation email", async () => {

            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            const findUser = await authTestManger.findUser(userData.email);

            console.log(findUser, "findUserfindUserfindUserfindUserfindUser")

            const coorectCode = await authService.confirmEmail(findUser.confirmation_code);
            expect(coorectCode).toBe(true);

            expect(emailAdapter.sendEmail).toHaveBeenCalled();
            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1);
        });
        it("+ successful message resending", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);
            await authService.resendingCode(userData.email);

            expect(emailAdapter.sendEmail).toHaveBeenCalled();
            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(2);
        });
        it("- failed to resend the message because the email has already been verified", async () => {

            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);
            const findUser = await authTestManger.findUser(userData.email);
            const coorectCode = await authService.confirmEmail(findUser.confirmation_code);
            expect(coorectCode).toBe(true);

            const result = await authService.resendingCode(userData.email);

            expect(result).toBe(false); //Вернет false, так как метод authService.resendingCode() в случае если код подтвержден, то возвращает false

            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1); // Вызовется 1 раз, так как в authService.resendingCode() в случае если окажется, что email уже подтвержден, он не будет вызывать sendEmail. Первый вызов это регистрация "await registerUserUseCas(userDto)"
        });
        it("- message resend failed because the user does not exist", async () => {

            const result = await authService.resendingCode("fdfdfdffd");

            expect(result).toBe(false); //Вернет false, так как authService.resendingCode() в случае если не найдет email или login, он возвращается false

            expect(emailAdapter.sendEmail).not.toHaveBeenCalled();
        });
        it("+ password update", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);


            await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })

            const resCode = await authService.passwordRecovery(userData.email)


            await authService.checkPasswordRecovery(resCode, "12345678")


            await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: userData.login,
                    password: userData.password,
                })
                .expect(HttpStatus.UNAUTHORIZED);


            await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: userData.login,
                    password: "12345678",
                })
                .expect(HttpStatus.OK);




            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(2);

        })
    });

    describe("authorization", () => {

        it("+ auth/login. Successful login", async () => {


            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            const result = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })


            expect(result.body).toEqual({
                accessToken: expect.any(String),
            });

            expect(result.headers["set-cookie"]).toBeDefined();

            expect(emailAdapter.sendEmail).toHaveBeenCalled();
            expect(emailAdapter.sendEmail).toHaveBeenCalledTimes(1);
        })
        it("- auth/login. The check failed due to the absence of this user", async () => {
            await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: "DSFSS",
                    password: "FSFSFS",
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });
        it("+ auth/logout. Successful exit", async () => {

            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);


            const result = await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: userData.login,
                    password: userData.password,
                })
                .expect(HttpStatus.OK);

            await request(app.getHttpServer()).post(`/api/auth/logout`).set("Cookie", result.headers["set-cookie"]).expect(204);
        });
        it("- auth/logout. invalid refreshToken", async () => {

            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            const result = await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: userData.login,
                    password: userData.password,
                })
                .expect(HttpStatus.OK);


            await delay(1000)
            await request(app.getHttpServer())
                .post(`/api/auth/refresh-token`).set("Cookie", result.headers["set-cookie"]).expect(HttpStatus.OK)

            await request(app.getHttpServer()).post(`/api/auth/logout`).set("Cookie", result.headers["set-cookie"]).expect(HttpStatus.UNAUTHORIZED);// Обновление refresh-token и соответсвенно обновление токина в сессии.

        });
        it("+ auth/refresh-token. Successful token update", async () => {


            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            const result = await request(app.getHttpServer())
                .post(`/api/auth/login`)
                .send({
                    loginOrEmail: userData.login,
                    password: userData.password,
                })
                .expect(HttpStatus.OK);

            await delay(1000)
            const newToken = await request(app.getHttpServer())
                .post(`/api/auth/refresh-token`)
                .set("Cookie", result.headers["set-cookie"])
                .expect(HttpStatus.OK);

            await request(app.getHttpServer()).post(`/api/auth/logout`).set("Cookie", result.headers["set-cookie"]).expect(HttpStatus.UNAUTHORIZED);

            await request(app.getHttpServer()).post(`/api/auth/logout`).set("Cookie", newToken.headers["set-cookie"]).expect(204);



        });
        it("+ login from different devices", async () => {

            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);

            const devicesOne = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })

            const payload = await new JwtService().decode(devicesOne.body.accessToken)


            await delay(1000)

            const devicesTwo = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })


            const devices = await authTestManger.getDivece(payload.userId)

            expect(devices).toHaveLength(2);


        })
        it("+ delete all sessions except the session from which you are making the request", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);



            const devicesCurrent = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })
            const payload = await new JwtService().decode(devicesCurrent.body.accessToken)


            const devicesTwo = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })
            const devicesThree = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })

            const cookies = devicesCurrent.headers['set-cookie']


            const devicesGet = await authTestManger.getDivece(payload.userId)

            expect(devicesGet).toHaveLength(3);

            await request(app.getHttpServer())
                .delete(`/api/security/devices`)
                .set('Cookie', cookies)
                .expect(204);



            const devices = await authTestManger.getDivece(payload.userId)

            expect(devices).toHaveLength(1);


        })
        it("+ delete one session", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            await authTestManger.registrationUser(userData);



            const devicesCurrent = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })
            const payload = await new JwtService().decode(devicesCurrent.body.accessToken)


            const devicesTwo = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })
            const devicesThree = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })

            const cookies = devicesCurrent.headers['set-cookie']


            console.log(payload, "devicesTwodevicesTwodevicesTwodevicesTwodevicesTwo")
            const devicesGet = await authTestManger.getDivece(payload.userId)

            expect(devicesGet).toHaveLength(3);

            await request(app.getHttpServer())
                .delete(`/api/security/devices/${payload.deviceId}`)
                .set('Cookie', cookies)
                .expect(204);



            const devices = await authTestManger.getDivece(payload.userId)

            expect(devices).toHaveLength(2);


        })
        it("- If try to delete the deviceId of other user", async () => {
            const userData = {
                login: "fdgfdgd",
                password: "string",
                email: "4e5.kn@mail.ru"
            }
            const userData2 = {
                login: "fdgfdgd2",
                password: "string",
                email: "1e1.kn@mail.ru"
            }

            await authTestManger.registrationUser(userData);
            await authTestManger.registrationUser(userData2);


            const devicesOne = await authTestManger.login({ loginOrEmail: userData.login, password: userData.password })
            const cookies = devicesOne.headers['set-cookie']

            const devicesTwo = await authTestManger.login({ loginOrEmail: userData2.login, password: userData2.password })
            const payload = await new JwtService().decode(devicesTwo.body.accessToken)


            await request(app.getHttpServer())
                .delete(`/api/security/devices/${payload.deviceId}`)
                .set('Cookie', cookies)
                .expect(403);


        })
    })
})


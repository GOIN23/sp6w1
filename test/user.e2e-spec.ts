import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { AppModule } from "../src/app.module";
import { EmailAdapter } from "../src/features/auth/application/emai-Adapter";
import { UserCreateModel } from "../src/features/user/models/input/create-user.input.model";
import { applyAppSettings } from "../src/settings/apply-app-setting";
import { EmailAdapterMock } from "./mock/email.adapter.mock";
import { aDescribe } from "./utils/aDescribe";
import { skipSettings } from "./utils/skip-settings";
import { UsersTestManager } from "./utils/users-test-manager";
export const ADMIN_AUTH = "admin:qwerty"; // get from SETTINGS
const buff2 = Buffer.from(ADMIN_AUTH, "utf8");
let codedAuth: string = buff2.toString("base64");

aDescribe(skipSettings.for('userTest'))("user test", () => {
    let app: INestApplication;
    let userTestManger: UsersTestManager;

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
        userTestManger = new UsersTestManager(app);
        console.log(process.env.ENV, "testesteeets");


    });

    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });

    afterAll(async () => {
        await app.close();
    });

    it("+ GET users = []", async () => {
        const resultExpext = {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        }
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }

        await userTestManger.getUsers(resultExpext, 200, authenticatioInformation)
    });

    it("- GET unauthorized request = []", async () => {
        const resultExpext = { statusCode: 401, path: '/api/users' }
        const authenticatioInformation = { Authorization: "Basic " + "ne correct" }

        await userTestManger.getUsers(resultExpext, 401, authenticatioInformation)
    });

    it('+ POST Users check creation user', async () => {
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }


        const createModel: UserCreateModel = {
            email: "4e5.kn@mail.ru",
            login: "adsmmmma",
            password: "123123123"
        };

        const createResponse = await userTestManger.createUser(createModel, 201, authenticatioInformation);

        userTestManger.expectCorrectModel(createModel, createResponse.body);

    });

    it("- POSTfailed request body blogId", async () => {
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }

        const createModel: UserCreateModel = {
            email: "4e5il.ru",
            login: "adsmmmma",
            password: "123123123"
        };

        const expextResult = {
            errorsMessages: [
                {
                    message: "email must be an email",
                    field: "email",
                },
            ],
        }
        await userTestManger.createUser(createModel, 400, authenticatioInformation, expextResult);


    });

    it("checking request parameters ", async () => {
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }
        const users = await userTestManger.createUsers(4)
        await userTestManger.getUsers(users.body, 200, authenticatioInformation)

    });

    it("checking query - pageSize and pageNumber", async () => {

        const authenticatioInformation = { Authorization: "Basic " + codedAuth }
        const users = await userTestManger.createUsers(3)
        await userTestManger.getUsers(users.body, 200, authenticatioInformation)


        await userTestManger.comparisonQueriesByQuery({ pageSize: 1, pageNumber: 2 }, {
            pagesCount: 3,
            page: 2,
            pageSize: 1,
            totalCount: 3,
            items: [users.body.items[1]],
        })

        await userTestManger.comparisonQueriesByQuery({ pageSize: 1, pageNumber: 3 }, {
            pagesCount: 3,
            page: 3,
            pageSize: 1,
            totalCount: 3,
            items: [users.body.items[2]],
        })



        await userTestManger.comparisonQueriesByQuery({ pageSize: 2, pageNumber: 1 }, {
            pagesCount: 2,
            page: 1,
            pageSize: 2,
            totalCount: 3,
            items: [users.body.items[0], users.body.items[1]],
        })





    });

    it("checking query - searchLoginTerm and searchEmailTerm", async () => {
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }
        const users = await userTestManger.createUsers(3)
        await userTestManger.getUsers(users.body, 200, authenticatioInformation)


        users.body.items.reverse()
        await userTestManger.comparisonQueriesByQuery({ searchLoginTerm: "adsm0mma" }, {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [users.body.items[0]],
        })


        await userTestManger.comparisonQueriesByQuery({ searchEmailTerm: "4e0" }, {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [users.body.items[0]],
        })


    });

    it("- DELETE product by incorrect ID", async () => {
        await userTestManger.deleteUser(2312, 404)
    });

    it("+ DELETE product by ID", async () => {
        const authenticatioInformation = { Authorization: "Basic " + codedAuth }


        const createModel: UserCreateModel = {
            email: "4e5.kn@mail.ru",
            login: "adsmmmma",
            password: "123123123"
        };

        const createResponse = await userTestManger.createUser(createModel, 201, authenticatioInformation);

        await userTestManger.deleteUser(createResponse.body.id, 204)
        const resultExpext = {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        }

        await userTestManger.getUsers(resultExpext, 200, authenticatioInformation)
    });
})
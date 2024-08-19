import { INestApplication } from "@nestjs/common";
import { UsersTestManager } from "./utils/users-test-manager";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { applyAppSettings } from "../src/settings/apply-app-setting";
import { UserCreateModel } from "../src/features/user/models/input/create-user.input.model";


describe("user test", () => {
    let app: INestApplication;
    let userTestManger: UsersTestManager;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();


        app = moduleFixture.createNestApplication()

        // Применяем все настройки приложения (pipes, guards, filters, ...)
        applyAppSettings(app);

        await app.init();

    });


    it('+/users check creation user', async () => {
        // Work with state

        const createModel: UserCreateModel = {
            email: "4e5.kn@mail.ru",
            login: "adsa",
            password: "123123123"
        };

        const createResponse = await userTestManger.createUser(createModel);

        userTestManger.expectCorrectModel(createModel, createResponse.body);



    });
})
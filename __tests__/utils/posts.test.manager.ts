import { INestApplication } from "@nestjs/common";
import * as request from 'supertest';
import { AuthTestMannager } from "./auth-test-manager";








const credentials = "admin:qwerty"


const buff2 = Buffer.from(credentials, "utf8");
const codedAuth: string = buff2.toString("base64");

export class PostTestMannager {
    alphabetLower: string[] = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];

    constructor(protected app: INestApplication, protected authTestManger: AuthTestMannager) { }


    async creatPostOne(input: any) {

        const result = await request(this.app.getHttpServer())
            .post('/api/sa/blogs')
            .set({ Authorization: "Basic " + codedAuth })
            .send({
                name: "string",
                description: "string",
                websiteUrl: "https://A9k3dqXmQg09DnH9pEgGN0-v64.yh9pEgmrf0I6mSDkAh-3H2-0M_SxHf5WEboprgrfa4jCt1-9i4cbFk_xfbEzkeLJ7",
            })



        const post = await request(this.app.getHttpServer())
            .post(`/api/sa/blogs/${result.body.id}/posts`)
            .set({ Authorization: "Basic " + codedAuth })
            .send(input)

        return post



    }
    async creatPostMany(num: number) {
        const result = await request(this.app.getHttpServer())
            .post('/api/sa/blogs')
            .set({ Authorization: "Basic " + codedAuth })
            .send({
                name: "string",
                description: "string",
                websiteUrl: "https://A9k3dqXmQg09DnH9pEgGN0-v64.yh9pEgmrf0I6mSDkAh-3H2-0M_SxHf5WEboprgrfa4jCt1-9i4cbFk_xfbEzkeLJ7",
            })


        for (let i = 0; i < num; i++) {
            await request(this.app.getHttpServer())
                .post(`/api/sa/blogs/${result.body.id}/posts`)
                .set({ Authorization: "Basic " + codedAuth })
                .send({
                    title: `${this.alphabetLower[i]}string`,
                    shortDescription: 'nghgfhfg',
                    content: 'string'
                })
        }


        return await request(this.app.getHttpServer()).get('/api/posts')

    }

    async createComments(num: number, postId: string) {
        const users = await this.authTestManger.registrationUsers(1)
        const tokenOneUser = await this.authTestManger.login({
            loginOrEmail: users[0].email,
            password: users[0].password
        })

        for (let i = 0; i < num; i++) {
            await request(this.app.getHttpServer())
                .post(`/api/posts/${postId}/comments`)
                .set({ Authorization: "Bearer " + tokenOneUser.body.accessToken })
                .send({
                    content: `${i}stringstringstringst`
                }
                ).expect(201) // like users on one post

        }



        return await request(this.app.getHttpServer())
            .get(`/api/posts/${postId}/comments`)
            .expect(200)









    }
}
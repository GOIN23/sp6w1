import { HttpStatus, INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from 'supertest';
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { applyAppSettings } from "../src/settings/apply-app-setting";
import { aDescribe } from "./utils/aDescribe";
import { AuthTestMannager } from "./utils/auth-test-manager";
import { PostTestMannager } from "./utils/posts.test.manager";
import { skipSettings } from "./utils/skip-settings";



aDescribe(skipSettings.for('postsTest'))("posts test", () => {
    let app: INestApplication;
    let postsTestManger: PostTestMannager;
    let authTestManger: AuthTestMannager;


    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();


        app = moduleFixture.createNestApplication()


        // Применяем все настройки приложения (pipes, guards, filters, ...)
        applyAppSettings(app);
        const dataSource = app.get(DataSource);
        authTestManger = new AuthTestMannager(app, dataSource);
        postsTestManger = new PostTestMannager(app, authTestManger)
        await app.init();


    });

    afterEach(async () => {
        await request(app.getHttpServer())
            .delete('/api/testing/all-data');
    });

    afterAll(async () => {
        await app.close();
    });

    it("+ GET products = []", async () => {
        await request(app.getHttpServer()).get('/api/posts').expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });
    it("+ POST successful request to create a post  ", async () => {


        const post = await postsTestManger.creatPostOne({
            title: 'string',
            shortDescription: 'nghgfhfg',
            content: 'string'
        });

        await request(app.getHttpServer()).get('/api/posts').expect(HttpStatus.OK, {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [post.body]
        });

    });
    it("+ GET product by ID with correct id", async () => {

        const post = await postsTestManger.creatPostOne({
            title: "saday",
            shortDescription: "jan",
            content: "blas asdsa",
        });

        await request(app.getHttpServer()).get(`/api/posts/${post.body.id}`).expect(HttpStatus.OK, post.body);
    });

    // tests query check!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    it("+ GET checking query - pageSize and pageNumber ", async () => {
        const result = await postsTestManger.creatPostMany(5);



        await request(app.getHttpServer())
            .get('/api/posts')
            .query({ pageSize: 1, pageNumber: 2 })
            .expect({
                pagesCount: 5,
                page: 2,
                pageSize: 1,
                totalCount: 5,
                items: [result.body.items[1]],
            });

        await request(app.getHttpServer())
            .get('/api/posts')
            .query({ pageSize: 1, pageNumber: 3 })
            .expect({
                pagesCount: 5,
                page: 3,
                pageSize: 1,
                totalCount: 5,
                items: [result.body.items[2]],
            });

        await request(app.getHttpServer())
            .get('/api/posts')
            .query({ pageSize: 2, pageNumber: 1 })
            .expect({
                pagesCount: 3,
                page: 1,
                pageSize: 2,
                totalCount: 5,
                items: [result.body.items[0], result.body.items[1]],
            });
    });

    it("+ GET checking query - sortDirection and sortBy", async () => {
        const result = await postsTestManger.creatPostMany(5);


        await request(app.getHttpServer())
            .get('/api/posts')
            .query({ sortBy: "title" }) // Since the default value is desc, the sorting will be in descending order. It turns out from the last letter of the alphabet to the first
            .expect({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 5,
                items: [result.body.items[0], result.body.items[1], result.body.items[2], result.body.items[3], result.body.items[4]],
            });

        await request(app.getHttpServer())
            .get('/api/posts')
            .query({ sortBy: "title", sortDirection: "asc" })
            .expect({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 5,
                items: [result.body.items[4], result.body.items[3], result.body.items[2], result.body.items[1], result.body.items[0]],
            });
    });

    it("checking likes and dislikes carried out by one user", async () => {
        const post = await postsTestManger.creatPostOne({
            title: "saday",
            shortDescription: "jan",
            content: "blas asdsa",
        });

        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }

        await authTestManger.registrationUser(userData)

        const tokens = await authTestManger.login({
            loginOrEmail: userData.login,
            password: userData.password
        })

        const payload = new JwtService().decode(tokens.body.accessToken)


        await request(app.getHttpServer())
            .put(`/api/posts/${post.body.id}/like-status`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204)



        const posts = await request(app.getHttpServer())
            .get(`/api/posts/${post.body.id}`).expect(HttpStatus.OK) //getting like from unauthorized user




        console.log(posts.body.extendedLikesInfo, "posts.bodyposts.bodyposts.bodyposts.body")

        expect(posts.body).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: "None",
                newestLikes: [
                    {
                        addedAt: expect.any(String),
                        userId: `${payload.userId}`,
                        login: payload.userLogin,
                    }

                ]
            }
        });

        const postsTwo = await request(app.getHttpServer())
            .get(`/api/posts/${post.body.id}`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })
            .expect(HttpStatus.OK) //getting a like from an authorized user

        expect(postsTwo.body).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: "Like",
                newestLikes: [
                    {
                        addedAt: expect.any(String),
                        userId: `${payload.userId}`,
                        login: payload.userLogin,
                    }

                ]
            }
        });


        await request(app.getHttpServer())
            .put(`/api/posts/${post.body.id}/like-status`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })
            .send({
                likeStatus: "Dislike"
            }).expect(204)


        const postsThree = await request(app.getHttpServer())
            .get(`/api/posts/${post.body.id}`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })

            .expect(HttpStatus.OK) //getting a like from an authorized user

        expect(postsThree.body).toEqual({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 1,
                myStatus: "Dislike",
                newestLikes: []
            }
        });




        // expect(posts.body).toBe()
    })

    it("one user likes one post, then the same user likes another post and then gets every post", async () => {


        const userData = {
            login: "fdgfdgd",
            password: "string",
            email: "4e5.kn@mail.ru"
        }


        await authTestManger.registrationUser(userData)


        const post = await postsTestManger.creatPostMany(2);

        const tokens = await authTestManger.login({
            loginOrEmail: userData.login,
            password: userData.password
        })

        const payload = new JwtService().decode(tokens.body.accessToken)


        await request(app.getHttpServer())
            .put(`/api/posts/${post.body.items[0].id}/like-status`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204) // like users on one post






        const posts = await request(app.getHttpServer())
            .get(`/api/posts/${post.body.items[0].id}`).expect(HttpStatus.OK)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })//getting like from authorized user


        expect(posts.body.extendedLikesInfo).toEqual({

            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payload.userId}`,
                    login: payload.userLogin,
                }

            ]

        });








        await request(app.getHttpServer())
            .put(`/api/posts/${post.body.items[1].id}/like-status`)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204) // like users on two post



        const postsTwo = await request(app.getHttpServer())
            .get(`/api/posts/${post.body.items[1].id}`).expect(HttpStatus.OK)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })//getting like from authorized user

        expect(postsTwo.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payload.userId}`,
                    login: payload.userLogin,
                }

            ]
        });



        const getPost = await request(app.getHttpServer())
            .get(`/api/posts`).expect(HttpStatus.OK)
            .set({ Authorization: "Bearer " + tokens.body.accessToken })//getting like from authorized user



        expect(getPost.body.items[0].extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payload.userId}`,
                    login: payload.userLogin,
                }

            ]
        })

        expect(getPost.body.items[1].extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payload.userId}`,
                    login: payload.userLogin,
                }

            ]
        })




    })

    it("+ POST create 1 posts then: like post 1 by user 1, user 2 ", async () => {

        const users = await authTestManger.registrationUsers(2)

        const posts = await postsTestManger.creatPostMany(1);


        const tokenOneUser = await authTestManger.login({
            loginOrEmail: users[0].email,
            password: users[0].password
        })
        const payloadOne = new JwtService().decode(tokenOneUser.body.accessToken)


        const tokenTwoUser = await authTestManger.login({
            loginOrEmail: users[1].email,
            password: users[1].password
        })


        const payloadTwo = new JwtService().decode(tokenTwoUser.body.accessToken)

        await request(app.getHttpServer())
            .put(`/api/posts/${posts.body.items[0].id}/like-status`)
            .set({ Authorization: "Bearer " + tokenOneUser.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204) // like users on one post


        await request(app.getHttpServer())
            .put(`/api/posts/${posts.body.items[0].id}/like-status`)
            .set({ Authorization: "Bearer " + tokenTwoUser.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204) // like users on one post





        const postsTwo = await request(app.getHttpServer())
            .get(`/api/posts/${posts.body.items[0].id}`).expect(HttpStatus.OK)


        expect(postsTwo.body.extendedLikesInfo).toEqual({
            likesCount: 2,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payloadTwo.userId}`,
                    login: payloadTwo.userLogin,
                },
                {
                    addedAt: expect.any(String),
                    userId: `${payloadOne.userId}`,
                    login: payloadOne.userLogin,
                },


            ]
        })








    })

    it("+ POST create 1 posts then: like post 1 by user 1, dislikes post 1 user 2 ", async () => {

        const users = await authTestManger.registrationUsers(2)

        const posts = await postsTestManger.creatPostMany(1);


        const tokenOneUser = await authTestManger.login({
            loginOrEmail: users[0].email,
            password: users[0].password
        })
        const payloadOne = new JwtService().decode(tokenOneUser.body.accessToken)


        const tokenTwoUser = await authTestManger.login({
            loginOrEmail: users[1].email,
            password: users[1].password
        })

        await request(app.getHttpServer())
            .put(`/api/posts/${posts.body.items[0].id}/like-status`)
            .set({ Authorization: "Bearer " + tokenOneUser.body.accessToken })
            .send({
                likeStatus: "Like"
            }).expect(204) // like users on one post


        await request(app.getHttpServer())
            .put(`/api/posts/${posts.body.items[0].id}/like-status`)
            .set({ Authorization: "Bearer " + tokenTwoUser.body.accessToken })
            .send({
                likeStatus: "Dislike"
            }).expect(204) // like users on one post





        const postsTwo = await request(app.getHttpServer())
            .get(`/api/posts/${posts.body.items[0].id}`).expect(HttpStatus.OK)


        expect(postsTwo.body.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: "None",
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: `${payloadOne.userId}`,
                    login: payloadOne.userLogin,
                },


            ]
        })








    })




    describe("comments test", () => {
        it("+ POST /api/posts/postId/comments, create two comments, then we get comments", async () => {

            const posts = await postsTestManger.creatPostMany(1);

            await postsTestManger.createComments(2, posts.body.items[0].id)

            const result = await request(app.getHttpServer())
                .get(`/api/posts/${posts.body.items[0].id}/comments`)
                .expect(200)

            console.log(result.body, 'result.bodyresult.bodyresult.body')

            expect(result.body.totalCount).toBe(2)



        })

        it("Like the one comment, then dislike the one comment.", async () => {
            const posts = await postsTestManger.creatPostMany(1);
            const user = await authTestManger.registrationUsers(1)


            const tokenOneUser = await authTestManger.login({
                loginOrEmail: user[0].email,
                password: user[0].password
            })
            const payloadOne = new JwtService().decode(tokenOneUser.body.accessToken)

            const comments = await postsTestManger.createComments(2, posts.body.items[0].id)




            await request(app.getHttpServer())
                .put(`/api/comments/${comments.body.items[0].id}/like-status`)
                .set({ Authorization: "Bearer " + tokenOneUser.body.accessToken })
                .send({
                    likeStatus: "Like"
                }).expect(204)


            const result = await request(app.getHttpServer())
                .get(`/api/comments/${comments.body.items[0].id}`)
                .expect(200)


            expect(result.body.likesInfo.likesCount).toBe(1)




            await request(app.getHttpServer())
                .put(`/api/comments/${comments.body.items[1].id}/like-status`)
                .set({ Authorization: "Bearer " + tokenOneUser.body.accessToken })
                .send({
                    likeStatus: "Like"
                }).expect(204)


            const result2 = await request(app.getHttpServer())
                .get(`/api/comments/${comments.body.items[1].id}`)
                .expect(200)


            expect(result2.body.likesInfo.likesCount).toBe(1)








            const commentsResult = await request(app.getHttpServer())
                .get(`/api/posts/${posts.body.items[0].id}/comments`).expect(200)





            expect(commentsResult.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [
                    {
                        id: '2',
                        content: '1stringstringstringst',
                        commentatorInfo: {
                            userId: payloadOne.userId.toString(),
                            userLogin: payloadOne.userLogin

                        },
                        createdAt: expect.any(String),
                        likesInfo: {
                            likesCount: 1,
                            dislikesCount: 0,
                            myStatus: "None"
                        }
                    },
                    {
                        id: '1',
                        content: '0stringstringstringst',
                        commentatorInfo: {
                            userId: payloadOne.userId.toString(),
                            userLogin: payloadOne.userLogin

                        },
                        createdAt: expect.any(String),
                        likesInfo: {
                            likesCount: 1,
                            dislikesCount: 0,
                            myStatus: "None"
                        }
                    }
                ]
            })










        })




    });




})
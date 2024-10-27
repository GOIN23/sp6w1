import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { PostsQuerySqlRepository } from "../../../src/features/content/posts/infrastructure/posts.query.sql-repository";
import { mockDataSource } from "../../mock/mock.dataSource";











describe('test method postQuerySqlRepository', () => {
    let postsQuerySqlRepository: PostsQuerySqlRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsQuerySqlRepository,
                { provide: DataSource, useValue: mockDataSource }, // Подменяем `DataSource` на мок
            ],
        }).compile();


        postsQuerySqlRepository = module.get(PostsQuerySqlRepository);
        console.log(postsQuerySqlRepository, "fsdfsdfsdfsdfsd")
    })
    afterEach(() => {
        jest.clearAllMocks();
    });



    describe("check getById method", () => {

        it('should return post data by postId', async () => {
            const postId = '1';

            // Подменяем результат запроса на данные поста
            mockDataSource.query.mockResolvedValueOnce([{ // Первый запрос (qureBlog)
                post_id: '1',
                title: 'Test Title',
                short_description: 'Short description',
                content: 'Post content',
                fk_blog: '1',
                blog_name: 'Test Blog',
                created_at: '2024-10-25T05:47:09.796Z',
            }])
                .mockResolvedValueOnce([{ // Второй запрос (qureCount)
                    count_dislike: 2,
                    count_like: 5,
                }])
                .mockResolvedValueOnce([{ // Третий запрос (userLike)
                    status: 'Like',
                }])
                .mockResolvedValueOnce([ // Четвертый запрос (countLikeUserQuery)
                    { created_at_inf: '2024-10-25T05:50:00.000Z', user_fk_id: '3', user_login: 'User3' },
                    { created_at_inf: '2024-10-25T05:45:00.000Z', user_fk_id: '4', user_login: 'User4' },
                ]);



            const result = await postsQuerySqlRepository.getById(postId);

            console.log(result, "resultresultresult")

            expect(mockDataSource.query).toHaveBeenCalledWith(expect.any(String), [postId]);
            expect(result).toEqual([
                {
                    post_id: '1',
                    title: 'Test Title',
                    short_description: 'Short description',
                    content: 'Post content',
                    fk_blog: '1',
                    blog_name: 'Test Blog',
                    created_at: '2024-10-25T05:47:09.796Z',
                },
            ])
        })
    })
})
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlog1730981350550 implements MigrationInterface {
    name = 'CreateBlog1730981350550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD "informatin" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "informatin"`);
    }

}

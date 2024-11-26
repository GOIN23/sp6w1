import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreateQuestions1731386031151 implements MigrationInterface {
    name = 'AddCreateQuestions1731386031151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions" ("questionsId" SERIAL NOT NULL, "body" character varying NOT NULL, "correctAnswers" text array NOT NULL, "published" boolean NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying, CONSTRAINT "PK_5261bb6170c7d9875ef78fc95ea" PRIMARY KEY ("questionsId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "questions"`);
    }

}

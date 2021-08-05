import {MigrationInterface, QueryRunner} from "typeorm";

export class test1628083524817 implements MigrationInterface {
    name = 'test1628083524817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teacher" ("id" character varying NOT NULL, "name" character varying NOT NULL, "title" character varying NOT NULL, "is_executive" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_2f807294148612a9751dacf1026" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "teacher"`);
    }

}

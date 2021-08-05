import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSubjectTable1628160569690 implements MigrationInterface {
    name = 'AddSubjectTable1628160569690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject" ("id" character varying NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "is_required" boolean NOT NULL, "credit" integer NOT NULL, "lectureHours" integer NOT NULL, "labHours" integer NOT NULL, "independentHours" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_12eee115462e38d62e5455fc054" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subject"`);
    }

}

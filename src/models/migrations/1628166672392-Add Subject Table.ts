import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSubjectTable1628166672392 implements MigrationInterface {
    name = 'AddSubjectTable1628166672392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subject" ("id" character varying NOT NULL, "code" character varying NOT NULL, "name" character varying NOT NULL, "is_required" boolean NOT NULL, "credit" integer NOT NULL, "lecture_hours" integer NOT NULL, "lab_hours" integer NOT NULL, "independent_hours" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_12eee115462e38d62e5455fc054" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subject"`);
    }

}

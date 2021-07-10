import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAccountModel1624703514799 implements MigrationInterface {
    name = 'CreateAccountModel1624703514799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "is_admin" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "account"`);
    }

}

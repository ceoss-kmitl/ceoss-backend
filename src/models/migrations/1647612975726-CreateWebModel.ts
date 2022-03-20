import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateWebModel1647612975726 implements MigrationInterface {
    name = 'CreateWebModel1647612975726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "web" ("id" character varying NOT NULL, "url" character varying NOT NULL, CONSTRAINT "PK_f851c4d446a8263566310103184" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "web"`);
    }

}

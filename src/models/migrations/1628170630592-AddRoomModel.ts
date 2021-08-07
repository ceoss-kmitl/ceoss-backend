import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRoomModel1628170630592 implements MigrationInterface {
    name = 'AddRoomModel1628170630592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room" ("id" character varying NOT NULL, "name" character varying NOT NULL, "capacity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "room"`);
    }

}

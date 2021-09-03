import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTimeModel1630666460341 implements MigrationInterface {
    name = 'CreateTimeModel1630666460341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time" ("id" character varying NOT NULL, "start_slot" integer NOT NULL, "end_slot" integer NOT NULL, "workload_id" character varying, CONSTRAINT "PK_9ec81ea937e5d405c33a9f49251" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "end_time_slot"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "start_time_slot"`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "start_time_slot" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "end_time_slot" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "time"`);
    }

}

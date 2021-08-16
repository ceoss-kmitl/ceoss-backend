import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateWorkloadModel1628844685935 implements MigrationInterface {
    name = 'CreateWorkloadModel1628844685935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "workload_type_enum" AS ENUM('LECTURE', 'LAB')`);
        await queryRunner.query(`CREATE TYPE "workload_day_of_week_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7')`);
        await queryRunner.query(`CREATE TABLE "workload" ("id" character varying NOT NULL, "section" integer NOT NULL, "type" "workload_type_enum" NOT NULL, "day_of_week" "workload_day_of_week_enum" NOT NULL, "start_time_slot" integer NOT NULL, "end_time_slot" integer NOT NULL, "is_compensated" boolean NOT NULL, "academic_year" integer NOT NULL, "semester" integer NOT NULL, "subject_id" character varying, "room_id" character varying, CONSTRAINT "PK_0b09d853b01db433645eccc2304" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teacher_workload" ("teacher_id" character varying NOT NULL, "workload_id" character varying NOT NULL, CONSTRAINT "PK_8baa5225590b1a3d2790015ecb0" PRIMARY KEY ("teacher_id", "workload_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71a108b692401250b9965100c0" ON "teacher_workload" ("teacher_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_581dd4668818d00c46e3cc6b13" ON "teacher_workload" ("workload_id") `);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_810a8089321e6d9a941cf8a169a" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_2e574bad38659a19116cf4195f7" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_71a108b692401250b9965100c07" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_581dd4668818d00c46e3cc6b136" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_581dd4668818d00c46e3cc6b136"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_2e574bad38659a19116cf4195f7"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_810a8089321e6d9a941cf8a169a"`);
        await queryRunner.query(`DROP INDEX "IDX_581dd4668818d00c46e3cc6b13"`);
        await queryRunner.query(`DROP INDEX "IDX_71a108b692401250b9965100c0"`);
        await queryRunner.query(`DROP TABLE "teacher_workload"`);
        await queryRunner.query(`DROP TABLE "workload"`);
        await queryRunner.query(`DROP TYPE "workload_day_of_week_enum"`);
        await queryRunner.query(`DROP TYPE "workload_type_enum"`);
    }

}

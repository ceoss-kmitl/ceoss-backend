import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateWorkloadModel1628569609236 implements MigrationInterface {
    name = 'CreateWorkloadModel1628569609236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "workload_type_enum" AS ENUM('LECTURE', 'LAB')`);
        await queryRunner.query(`CREATE TYPE "workload_day_of_week_enum" AS ENUM('1', '2', '3', '4', '5', '6', '7')`);
        await queryRunner.query(`CREATE TABLE "workload" ("id" character varying NOT NULL, "section" integer NOT NULL, "type" "workload_type_enum" NOT NULL, "day_of_week" "workload_day_of_week_enum" NOT NULL, "start_time_slot" integer NOT NULL, "end_time_slot" integer NOT NULL, "is_compensated" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "subjectId" character varying, "roomId" character varying, CONSTRAINT "PK_0b09d853b01db433645eccc2304" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teacher_workload" ("teacherId" character varying NOT NULL, "workloadId" character varying NOT NULL, CONSTRAINT "PK_2d4634ec333a366dddbd07c0a78" PRIMARY KEY ("teacherId", "workloadId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7508800a1ba5635af05e04d5be" ON "teacher_workload" ("teacherId") `);
        await queryRunner.query(`CREATE INDEX "IDX_50d290e5b929b133a631f13aeb" ON "teacher_workload" ("workloadId") `);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_127424d6821f4ed61c98ca3278b" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_64ac7c260829e204944e0b3f745" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_7508800a1ba5635af05e04d5bea" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_50d290e5b929b133a631f13aeb5" FOREIGN KEY ("workloadId") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_50d290e5b929b133a631f13aeb5"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_7508800a1ba5635af05e04d5bea"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_64ac7c260829e204944e0b3f745"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_127424d6821f4ed61c98ca3278b"`);
        await queryRunner.query(`DROP INDEX "IDX_50d290e5b929b133a631f13aeb"`);
        await queryRunner.query(`DROP INDEX "IDX_7508800a1ba5635af05e04d5be"`);
        await queryRunner.query(`DROP TABLE "teacher_workload"`);
        await queryRunner.query(`DROP TABLE "workload"`);
        await queryRunner.query(`DROP TYPE "workload_day_of_week_enum"`);
        await queryRunner.query(`DROP TYPE "workload_type_enum"`);
    }

}

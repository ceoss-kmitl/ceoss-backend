import {MigrationInterface, QueryRunner} from "typeorm";

export class YearSemesterInWorkload1628842467892 implements MigrationInterface {
    name = 'YearSemesterInWorkload1628842467892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_127424d6821f4ed61c98ca3278b"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_64ac7c260829e204944e0b3f745"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "subjectId"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "roomId"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "academic_year" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "semester" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "subject_id" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "room_id" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_810a8089321e6d9a941cf8a169a" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_2e574bad38659a19116cf4195f7" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_2e574bad38659a19116cf4195f7"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_810a8089321e6d9a941cf8a169a"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "subject_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "semester"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "academic_year"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "roomId" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "subjectId" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_64ac7c260829e204944e0b3f745" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_127424d6821f4ed61c98ca3278b" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

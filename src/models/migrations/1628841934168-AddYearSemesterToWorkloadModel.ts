import {MigrationInterface, QueryRunner} from "typeorm";

export class AddYearSemesterToWorkloadModel1628841934168 implements MigrationInterface {
    name = 'AddYearSemesterToWorkloadModel1628841934168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "academic_year" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "semester" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "semester"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "academic_year"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}

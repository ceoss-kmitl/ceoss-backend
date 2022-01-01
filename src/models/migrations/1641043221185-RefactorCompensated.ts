import {MigrationInterface, QueryRunner} from "typeorm";

export class RefactorCompensated1641043221185 implements MigrationInterface {
    name = 'RefactorCompensated1641043221185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_41a17c3d714b31301411f602720"`);
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_4e99ad0ee1d6c9ba1d71be403fd"`);
        await queryRunner.query(`ALTER TABLE "time" DROP COLUMN "compensated_original_id"`);
        await queryRunner.query(`ALTER TABLE "time" DROP COLUMN "compensated_id"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "compensation_date" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "compensation_from_id" character varying`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "curriculum_code" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "is_inter" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "executive_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_active" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_external" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_98222cf0547c7cc609ae3208887" FOREIGN KEY ("compensation_from_id") REFERENCES "workload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_98222cf0547c7cc609ae3208887"`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_external" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_active" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "executive_role" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "is_inter" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "curriculum_code" SET DEFAULT 'CE'`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "compensation_from_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "compensation_date"`);
        await queryRunner.query(`ALTER TABLE "time" ADD "compensated_id" character varying`);
        await queryRunner.query(`ALTER TABLE "time" ADD "compensated_original_id" character varying`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_4e99ad0ee1d6c9ba1d71be403fd" FOREIGN KEY ("compensated_id") REFERENCES "compensated"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_41a17c3d714b31301411f602720" FOREIGN KEY ("compensated_original_id") REFERENCES "compensated"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class Refactor1640959850895 implements MigrationInterface {
    name = 'Refactor1640959850895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "curriculum_code" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "is_inter" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "executive_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_active" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_external" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_external" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "is_active" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "teacher" ALTER COLUMN "executive_role" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "is_inter" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subject" ALTER COLUMN "curriculum_code" SET DEFAULT 'CE'`);
    }

}

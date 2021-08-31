import {MigrationInterface, QueryRunner} from "typeorm";

export class AddInterCirriculumAndExternalTeacherPayRate1630242155629 implements MigrationInterface {
    name = 'AddInterCirriculumAndExternalTeacherPayRate1630242155629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRate"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRate"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateNormal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateNormal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateInter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateInter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateExternal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateExternal" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateExternal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateExternal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateInter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateInter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateNormal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateNormal"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRate" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRate" integer NOT NULL`);
    }

}

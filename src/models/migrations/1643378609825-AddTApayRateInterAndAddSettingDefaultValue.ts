import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTApayRateInterAndAddSettingDefaultValue1643378609825 implements MigrationInterface {
    name = 'AddTApayRateInterAndAddSettingDefaultValue1643378609825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ADD "assistant_pay_rate_inter" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "dean_name" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "vice_dean_name" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "head_name" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "director_siie_name" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_normal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_normal" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_inter" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_inter" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_external" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_external" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "normal_claim_limit" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "inter_claim_limit" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "inter_claim_limit" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "normal_claim_limit" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_external" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_external" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_inter" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_inter" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lab_pay_rate_normal" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "lecture_pay_rate_normal" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "director_siie_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "head_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "vice_dean_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" ALTER COLUMN "dean_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "assistant_pay_rate_inter"`);
    }

}

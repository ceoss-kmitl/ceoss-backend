import {MigrationInterface, QueryRunner} from "typeorm";

export class SnakeCaseNaming1630820628336 implements MigrationInterface {
    name = 'SnakeCaseNaming1630820628336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" RENAME COLUMN "fieldOfStudy" TO "field_of_study"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "deanName"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "headName"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "normalClaimLimit"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "interClaimLimit"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "webScrapUrl"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "webScrapUpdatedDate"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "viceDeanName"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "directorSIIEName"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateNormal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateNormal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateInter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateInter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecturePayRateExternal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "labPayRateExternal"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "dean_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "vice_dean_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "head_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "director_siie_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecture_pay_rate_normal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lab_pay_rate_normal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecture_pay_rate_inter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lab_pay_rate_inter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecture_pay_rate_external" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lab_pay_rate_external" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "normal_claim_limit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "inter_claim_limit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "web_scrap_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "web_scrap_updated_date" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "web_scrap_updated_date"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "web_scrap_url"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "inter_claim_limit"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "normal_claim_limit"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lab_pay_rate_external"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecture_pay_rate_external"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lab_pay_rate_inter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecture_pay_rate_inter"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lab_pay_rate_normal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "lecture_pay_rate_normal"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "director_siie_name"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "head_name"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "vice_dean_name"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "dean_name"`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateExternal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateExternal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateInter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateInter" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "labPayRateNormal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "lecturePayRateNormal" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "directorSIIEName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "viceDeanName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "webScrapUpdatedDate" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "webScrapUrl" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "interClaimLimit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "normalClaimLimit" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "headName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "deanName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" RENAME COLUMN "field_of_study" TO "fieldOfStudy"`);
    }

}

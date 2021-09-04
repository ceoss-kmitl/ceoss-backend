import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCurriculumCodeAndIsInter1630765934752 implements MigrationInterface {
    name = 'AddCurriculumCodeAndIsInter1630765934752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" ADD "curriculum_code" character varying NOT NULL DEFAULT 'CE'`);
        await queryRunner.query(`ALTER TABLE "subject" ADD "is_inter" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "is_inter"`);
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "curriculum_code"`);
    }

}

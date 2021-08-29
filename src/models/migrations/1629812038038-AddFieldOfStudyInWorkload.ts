import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFieldOfStudyInWorkload1629812038038 implements MigrationInterface {
    name = 'AddFieldOfStudyInWorkload1629812038038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" ADD "fieldOfStudy" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "fieldOfStudy"`);
    }

}

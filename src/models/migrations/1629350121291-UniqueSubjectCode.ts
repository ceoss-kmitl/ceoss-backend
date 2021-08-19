import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueSubjectCode1629350121291 implements MigrationInterface {
    name = 'UniqueSubjectCode1629350121291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" ADD CONSTRAINT "UQ_92374adc6b583e8cf659977e489" UNIQUE ("code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" DROP CONSTRAINT "UQ_92374adc6b583e8cf659977e489"`);
    }

}

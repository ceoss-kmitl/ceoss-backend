import {MigrationInterface, QueryRunner} from "typeorm";

export class AddClassYearToWorkload1629960284614 implements MigrationInterface {
    name = 'AddClassYearToWorkload1629960284614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" ADD "class_year" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "class_year"`);
    }

}

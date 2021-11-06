import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeWeekCountToFloat1635603651651 implements MigrationInterface {
    name = 'ChangeWeekCountToFloat1635603651651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "week_count"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "week_count" real NOT NULL DEFAULT '15'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "week_count"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "week_count" integer NOT NULL DEFAULT '15'`);
    }

}

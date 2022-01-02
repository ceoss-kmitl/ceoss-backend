import {MigrationInterface, QueryRunner} from "typeorm";

export class DayOfWeekEnumUpdate1641112195120 implements MigrationInterface {
    name = 'DayOfWeekEnumUpdate1641112195120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "workload_day_of_week_enum" RENAME TO "workload_day_of_week_enum_old"`);
        await queryRunner.query(`CREATE TYPE "workload_day_of_week_enum" AS ENUM('0', '1', '2', '3', '4', '5', '6')`);
        await queryRunner.query(`ALTER TABLE "workload" ALTER COLUMN "day_of_week" TYPE "workload_day_of_week_enum" USING "day_of_week"::"text"::"workload_day_of_week_enum"`);
        await queryRunner.query(`DROP TYPE "workload_day_of_week_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "workload_day_of_week_enum_old" AS ENUM('1', '2', '3', '4', '5', '6', '7')`);
        await queryRunner.query(`ALTER TABLE "workload" ALTER COLUMN "day_of_week" TYPE "workload_day_of_week_enum_old" USING "day_of_week"::"text"::"workload_day_of_week_enum_old"`);
        await queryRunner.query(`DROP TYPE "workload_day_of_week_enum"`);
        await queryRunner.query(`ALTER TYPE "workload_day_of_week_enum_old" RENAME TO "workload_day_of_week_enum"`);
    }

}

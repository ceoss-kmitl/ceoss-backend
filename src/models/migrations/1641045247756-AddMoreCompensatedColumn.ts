import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMoreCompensatedColumn1641045247756 implements MigrationInterface {
    name = 'AddMoreCompensatedColumn1641045247756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" ADD "compensation_from_date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "compensation_from_date"`);
    }

}

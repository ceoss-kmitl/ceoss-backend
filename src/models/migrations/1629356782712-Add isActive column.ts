import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsActiveColumn1629356782712 implements MigrationInterface {
    name = 'AddIsActiveColumn1629356782712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ADD "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "is_active"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class EditIsExecutiveToString1631105169035 implements MigrationInterface {
    name = 'EditIsExecutiveToString1631105169035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" RENAME COLUMN "is_executive" TO "executive_role"`);
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "executive_role"`);
        await queryRunner.query(`ALTER TABLE "teacher" ADD "executive_role" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "executive_role"`);
        await queryRunner.query(`ALTER TABLE "teacher" ADD "executive_role" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teacher" RENAME COLUMN "executive_role" TO "is_executive"`);
    }

}

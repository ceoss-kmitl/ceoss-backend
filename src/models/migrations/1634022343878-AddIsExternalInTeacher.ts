import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsExternalInTeacher1634022343878 implements MigrationInterface {
    name = 'AddIsExternalInTeacher1634022343878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ADD "is_external" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "is_external"`);
    }

}

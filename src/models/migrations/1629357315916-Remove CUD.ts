import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveCUD1629357315916 implements MigrationInterface {
    name = 'RemoveCUD1629357315916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "teacher" DROP COLUMN "deleted_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "teacher" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "teacher" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}

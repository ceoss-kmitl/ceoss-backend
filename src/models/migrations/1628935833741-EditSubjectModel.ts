import {MigrationInterface, QueryRunner} from "typeorm";

export class EditSubjectModel1628935833741 implements MigrationInterface {
    name = 'EditSubjectModel1628935833741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "deleted_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "subject" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "subject" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}

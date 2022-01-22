import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteUnusedCompensatedTable1642829919252 implements MigrationInterface {
    name = 'DeleteUnusedCompensatedTable1642829919252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "compensated"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

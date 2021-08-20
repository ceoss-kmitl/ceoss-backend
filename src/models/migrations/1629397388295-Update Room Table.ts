import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateRoomTable1629397388295 implements MigrationInterface {
    name = 'UpdateRoomTable1629397388295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "room" DROP COLUMN "deleted_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "room" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "room" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}

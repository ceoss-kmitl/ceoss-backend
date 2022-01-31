import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRequiredRoomIntoSubject1643610203585 implements MigrationInterface {
    name = 'AddRequiredRoomIntoSubject1643610203585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" ADD "required_room" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subject" DROP COLUMN "required_room"`);
    }

}

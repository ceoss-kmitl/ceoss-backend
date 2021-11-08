import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCompensatedRoom1636356387260 implements MigrationInterface {
    name = 'AddCompensatedRoom1636356387260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compensated" ADD "compensated_room_id" character varying`);
        await queryRunner.query(`ALTER TABLE "compensated" ADD CONSTRAINT "FK_189038ad9b45dd582a3cda498fa" FOREIGN KEY ("compensated_room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compensated" DROP CONSTRAINT "FK_189038ad9b45dd582a3cda498fa"`);
        await queryRunner.query(`ALTER TABLE "compensated" DROP COLUMN "compensated_room_id"`);
    }

}

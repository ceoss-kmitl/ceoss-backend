import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateCompensatedTable1636362244423 implements MigrationInterface {
    name = 'UpdateCompensatedTable1636362244423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time" ADD "compensated_original_id" character varying`);
        await queryRunner.query(`ALTER TABLE "time" ADD "compensated_id" character varying`);
        await queryRunner.query(`ALTER TABLE "compensated" ADD "compensated_room_id" character varying`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_41a17c3d714b31301411f602720" FOREIGN KEY ("compensated_original_id") REFERENCES "compensated"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_4e99ad0ee1d6c9ba1d71be403fd" FOREIGN KEY ("compensated_id") REFERENCES "compensated"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "compensated" ADD CONSTRAINT "FK_189038ad9b45dd582a3cda498fa" FOREIGN KEY ("compensated_room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compensated" DROP CONSTRAINT "FK_189038ad9b45dd582a3cda498fa"`);
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_4e99ad0ee1d6c9ba1d71be403fd"`);
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_41a17c3d714b31301411f602720"`);
        await queryRunner.query(`ALTER TABLE "compensated" DROP COLUMN "compensated_room_id"`);
        await queryRunner.query(`ALTER TABLE "time" DROP COLUMN "compensated_id"`);
        await queryRunner.query(`ALTER TABLE "time" DROP COLUMN "compensated_original_id"`);
    }

}

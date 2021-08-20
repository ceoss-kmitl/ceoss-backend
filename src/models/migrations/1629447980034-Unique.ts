import {MigrationInterface, QueryRunner} from "typeorm";

export class Unique1629447980034 implements MigrationInterface {
    name = 'Unique1629447980034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "UQ_535c742a3606d2e3122f441b26c" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "UQ_535c742a3606d2e3122f441b26c"`);
    }

}

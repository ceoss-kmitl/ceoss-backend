import {MigrationInterface, QueryRunner} from "typeorm";

export class Unique1629365851000 implements MigrationInterface {
    name = 'Unique1629365851000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" ADD CONSTRAINT "UQ_55be152c2c710d5939dae9a86aa" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher" DROP CONSTRAINT "UQ_55be152c2c710d5939dae9a86aa"`);
    }

}

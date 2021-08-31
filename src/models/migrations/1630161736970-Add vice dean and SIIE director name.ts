import {MigrationInterface, QueryRunner} from "typeorm";

export class AddViceDeanAndSIIEDirectorName1630161736970 implements MigrationInterface {
    name = 'AddViceDeanAndSIIEDirectorName1630161736970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ADD "viceDeanName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "setting" ADD "directorSIIEName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "directorSIIEName"`);
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "viceDeanName"`);
    }

}

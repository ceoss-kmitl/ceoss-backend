import {MigrationInterface, QueryRunner} from "typeorm";

export class AddViceDeanAndSIIEDirectorName1630157178329 implements MigrationInterface {
    name = 'AddViceDeanAndSIIEDirectorName1630157178329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ADD "directorSIIEName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "directorSIIEName"`);
    }

}

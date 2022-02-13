import {MigrationInterface, QueryRunner} from "typeorm";

export class onDeleteCompensationFrom1641116185933 implements MigrationInterface {
    name = 'onDeleteCompensationFrom1641116185933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_98222cf0547c7cc609ae3208887"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_98222cf0547c7cc609ae3208887" FOREIGN KEY ("compensation_from_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_98222cf0547c7cc609ae3208887"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_98222cf0547c7cc609ae3208887" FOREIGN KEY ("compensation_from_id") REFERENCES "workload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

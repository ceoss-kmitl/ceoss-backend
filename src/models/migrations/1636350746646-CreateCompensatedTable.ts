import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCompensatedTable1636350746646 implements MigrationInterface {
    name = 'CreateCompensatedTable1636350746646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compensated" ("id" character varying NOT NULL, "original_date" TIMESTAMP WITH TIME ZONE NOT NULL, "compensated_date" TIMESTAMP WITH TIME ZONE NOT NULL, "workload_id" character varying, CONSTRAINT "PK_7e5e777876ac3dd2500fe1e93cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "is_compensated"`);
        await queryRunner.query(`ALTER TABLE "compensated" ADD CONSTRAINT "FK_85530d566dbf7bb4a7080b50466" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compensated" DROP CONSTRAINT "FK_85530d566dbf7bb4a7080b50466"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "is_compensated" boolean NOT NULL`);
        await queryRunner.query(`DROP TABLE "compensated"`);
    }

}

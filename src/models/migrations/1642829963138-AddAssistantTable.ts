import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAssistantTable1642829963138 implements MigrationInterface {
    name = 'AddAssistantTable1642829963138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "assistant_workload" ("day_list" TIMESTAMP WITH TIME ZONE array NOT NULL DEFAULT '{}', "assistant_id" character varying NOT NULL, "workload_id" character varying NOT NULL, CONSTRAINT "PK_61d4048046a0fea93e78a7f28e5" PRIMARY KEY ("assistant_id", "workload_id"))`);
        await queryRunner.query(`CREATE TABLE "assistant" ("id" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_8ff050116f0a97df2c03ec92e5e" UNIQUE ("name"), CONSTRAINT "PK_eb7d5dbc702c098df659e65c606" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "assistant_workload" ADD CONSTRAINT "FK_5296ac1f4e245b0a62f8e7d6f89" FOREIGN KEY ("assistant_id") REFERENCES "assistant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assistant_workload" ADD CONSTRAINT "FK_6c7e99a86a657cfa60bd6048c1e" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assistant_workload" DROP CONSTRAINT "FK_6c7e99a86a657cfa60bd6048c1e"`);
        await queryRunner.query(`ALTER TABLE "assistant_workload" DROP CONSTRAINT "FK_5296ac1f4e245b0a62f8e7d6f89"`);
        await queryRunner.query(`DROP TABLE "assistant"`);
        await queryRunner.query(`DROP TABLE "assistant_workload"`);
    }

}

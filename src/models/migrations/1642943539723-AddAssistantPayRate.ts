import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAssistantPayRate1642943539723 implements MigrationInterface {
    name = 'AddAssistantPayRate1642943539723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ADD "assistant_pay_rate" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP COLUMN "assistant_pay_rate"`);
    }

}

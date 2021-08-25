import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSettingModel1629624887212 implements MigrationInterface {
    name = 'CreateSettingModel1629624887212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "setting" ("id" character varying NOT NULL, "deanName" character varying NOT NULL, "headName" character varying NOT NULL, "lecturePayRate" integer NOT NULL, "labPayRate" integer NOT NULL, "normalClaimLimit" integer NOT NULL, "interClaimLimit" integer NOT NULL, "webScrapUrl" character varying NOT NULL, "webScrapUpdatedDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "setting"`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class RefacterAuth1646359269548 implements MigrationInterface {
    name = 'RefacterAuth1646359269548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "refresh_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_1810939ed60edf0bce9545523b7" UNIQUE ("refresh_token")`);
        await queryRunner.query(`ALTER TABLE "account" ADD "device_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_de1ee3c2f443c5fa14bb6851f09" UNIQUE ("device_id")`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "PK_4c8f96ccf523e9a3faefd5bdd4c" PRIMARY KEY ("email")`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "PK_4c8f96ccf523e9a3faefd5bdd4c"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_de1ee3c2f443c5fa14bb6851f09"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "device_id"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_1810939ed60edf0bce9545523b7"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "account" ADD "access_token" character varying`);
    }

}

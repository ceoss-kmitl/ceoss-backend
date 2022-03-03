import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateAccount1646304508297 implements MigrationInterface {
    name = 'UpdateAccount1646304508297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "refresh_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "PK_4c8f96ccf523e9a3faefd5bdd4c" PRIMARY KEY ("email")`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c"`);
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "access_token" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" ALTER COLUMN "access_token" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "PK_4c8f96ccf523e9a3faefd5bdd4c"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")`);
    }

}

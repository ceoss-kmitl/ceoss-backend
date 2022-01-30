import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateAccountModel1643447734975 implements MigrationInterface {
    name = 'UpdateAccountModel1643447734975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "is_admin"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "account" ADD "access_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c"`);
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "account" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "account" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "account" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "account" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "account" ADD "is_admin" boolean NOT NULL`);
    }

}

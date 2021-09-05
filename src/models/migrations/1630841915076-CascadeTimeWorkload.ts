import {MigrationInterface, QueryRunner} from "typeorm";

export class CascadeTimeWorkload1630841915076 implements MigrationInterface {
    name = 'CascadeTimeWorkload1630841915076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c"`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time" DROP CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c"`);
        await queryRunner.query(`ALTER TABLE "time" ADD CONSTRAINT "FK_05f596ec93955a3f0d11468cf3c" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTeacherWorkload1632229044686 implements MigrationInterface {
    name = 'AddTeacherWorkload1632229044686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_581dd4668818d00c46e3cc6b136"`);
        await queryRunner.query(`DROP INDEX "IDX_71a108b692401250b9965100c0"`);
        await queryRunner.query(`DROP INDEX "IDX_581dd4668818d00c46e3cc6b13"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "week_count" integer NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_71a108b692401250b9965100c07" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_581dd4668818d00c46e3cc6b136" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_581dd4668818d00c46e3cc6b136"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "week_count"`);
        await queryRunner.query(`CREATE INDEX "IDX_581dd4668818d00c46e3cc6b13" ON "teacher_workload" ("workload_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_71a108b692401250b9965100c0" ON "teacher_workload" ("teacher_id") `);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_581dd4668818d00c46e3cc6b136" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_71a108b692401250b9965100c07" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}

import {MigrationInterface, QueryRunner} from "typeorm";

export class YearSemesterWorkload1628844311198 implements MigrationInterface {
    name = 'YearSemesterWorkload1628844311198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_64ac7c260829e204944e0b3f745"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_127424d6821f4ed61c98ca3278b"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_7508800a1ba5635af05e04d5bea"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_50d290e5b929b133a631f13aeb5"`);
        await queryRunner.query(`DROP INDEX "IDX_7508800a1ba5635af05e04d5be"`);
        await queryRunner.query(`DROP INDEX "IDX_50d290e5b929b133a631f13aeb"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "roomId"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "subjectId"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_2d4634ec333a366dddbd07c0a78"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_50d290e5b929b133a631f13aeb5" PRIMARY KEY ("workloadId")`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "teacherId"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_50d290e5b929b133a631f13aeb5"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "workloadId"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "academic_year" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "semester" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "subject_id" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "room_id" character varying`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "teacher_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_71a108b692401250b9965100c07" PRIMARY KEY ("teacher_id")`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "workload_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_8baa5225590b1a3d2790015ecb0" PRIMARY KEY ("teacher_id", "workload_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_71a108b692401250b9965100c0" ON "teacher_workload" ("teacher_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_581dd4668818d00c46e3cc6b13" ON "teacher_workload" ("workload_id") `);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_810a8089321e6d9a941cf8a169a" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_2e574bad38659a19116cf4195f7" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_71a108b692401250b9965100c07" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_581dd4668818d00c46e3cc6b136" FOREIGN KEY ("workload_id") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_581dd4668818d00c46e3cc6b136"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "FK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_2e574bad38659a19116cf4195f7"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_810a8089321e6d9a941cf8a169a"`);
        await queryRunner.query(`DROP INDEX "IDX_581dd4668818d00c46e3cc6b13"`);
        await queryRunner.query(`DROP INDEX "IDX_71a108b692401250b9965100c0"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_8baa5225590b1a3d2790015ecb0"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_71a108b692401250b9965100c07" PRIMARY KEY ("teacher_id")`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "workload_id"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_71a108b692401250b9965100c07"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP COLUMN "teacher_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "room_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "subject_id"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "semester"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "academic_year"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "workloadId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_50d290e5b929b133a631f13aeb5" PRIMARY KEY ("workloadId")`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD "teacherId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" DROP CONSTRAINT "PK_50d290e5b929b133a631f13aeb5"`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "PK_2d4634ec333a366dddbd07c0a78" PRIMARY KEY ("teacherId", "workloadId")`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "subjectId" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "roomId" character varying`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_50d290e5b929b133a631f13aeb" ON "teacher_workload" ("workloadId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7508800a1ba5635af05e04d5be" ON "teacher_workload" ("teacherId") `);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_50d290e5b929b133a631f13aeb5" FOREIGN KEY ("workloadId") REFERENCES "workload"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_workload" ADD CONSTRAINT "FK_7508800a1ba5635af05e04d5bea" FOREIGN KEY ("teacherId") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_127424d6821f4ed61c98ca3278b" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_64ac7c260829e204944e0b3f745" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

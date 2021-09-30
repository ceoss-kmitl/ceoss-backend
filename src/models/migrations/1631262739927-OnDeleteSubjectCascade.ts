import {MigrationInterface, QueryRunner} from "typeorm";

export class OnDeleteSubjectCascade1631262739927 implements MigrationInterface {
    name = 'OnDeleteSubjectCascade1631262739927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_2e574bad38659a19116cf4195f7"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_810a8089321e6d9a941cf8a169a"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_810a8089321e6d9a941cf8a169a" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_2e574bad38659a19116cf4195f7" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_2e574bad38659a19116cf4195f7"`);
        await queryRunner.query(`ALTER TABLE "workload" DROP CONSTRAINT "FK_810a8089321e6d9a941cf8a169a"`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_810a8089321e6d9a941cf8a169a" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workload" ADD CONSTRAINT "FK_2e574bad38659a19116cf4195f7" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

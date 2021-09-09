import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDegreeInWorkload1631011286420 implements MigrationInterface {
    name = 'AddDegreeInWorkload1631011286420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "workload_degree_enum" AS ENUM('BACHELOR', 'BACHELOR_CONTINUE', 'BACHELOR_INTER', 'PUNDIT', 'PUNDIT_INTER')`);
        await queryRunner.query(`ALTER TABLE "workload" ADD "degree" "workload_degree_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workload" DROP COLUMN "degree"`);
        await queryRunner.query(`DROP TYPE "workload_degree_enum"`);
    }

}

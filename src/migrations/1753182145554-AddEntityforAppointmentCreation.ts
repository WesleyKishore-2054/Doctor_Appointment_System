import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityforAppointmentCreation1753182145554 implements MigrationInterface {
    name = 'AddEntityforAppointmentCreation1753182145554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "actualStartTime" TIME`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "actualEndTime" TIME`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "actualEndTime"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "actualStartTime"`);
    }

}

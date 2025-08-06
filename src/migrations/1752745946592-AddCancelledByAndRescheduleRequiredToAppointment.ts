import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCancelledByAndRescheduleRequiredToAppointment1752745946592 implements MigrationInterface {
    name = 'AddCancelledByAndRescheduleRequiredToAppointment1752745946592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "cancelledBy" character varying`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "rescheduleRequired" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "rescheduleRequired"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "cancelledBy"`);
    }

}

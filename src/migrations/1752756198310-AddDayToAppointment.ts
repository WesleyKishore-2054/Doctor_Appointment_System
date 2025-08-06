import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayToAppointment1752756198310 implements MigrationInterface {
    name = 'AddDayToAppointment1752756198310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "day" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "day"`);
    }

}

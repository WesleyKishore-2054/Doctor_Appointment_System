import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayToAppointment1752818924016 implements MigrationInterface {
    name = 'AddDayToAppointment1752818924016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "slot_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13" FOREIGN KEY ("slot_id") REFERENCES "available_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "slot_id"`);
    }

}

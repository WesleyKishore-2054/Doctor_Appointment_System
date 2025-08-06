import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlotAndAppointmentRelations1752822198246 implements MigrationInterface {
    name = 'AddSlotAndAppointmentRelations1752822198246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctor_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "slot_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patientId" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorId" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "slotId" integer`);
        await queryRunner.query(`ALTER TABLE "available_slots" ALTER COLUMN "maxBookings" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_074c4e87da10ac958c44c9562f3" FOREIGN KEY ("slotId") REFERENCES "available_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_074c4e87da10ac958c44c9562f3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_0c1af27b469cb8dca420c160d65"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "available_slots" ALTER COLUMN "maxBookings" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "slotId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patientId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "slot_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctor_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patient_id" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13" FOREIGN KEY ("slot_id") REFERENCES "available_slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

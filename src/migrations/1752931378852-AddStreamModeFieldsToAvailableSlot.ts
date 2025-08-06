import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStreamModeFieldsToAvailableSlot1752931378852
  implements MigrationInterface
{
  name = 'AddStreamModeFieldsToAvailableSlot1752931378852';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "available_slots" ADD "slotDuration" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "available_slots" ADD "patientGap" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "available_slots" ADD "emergency" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "available_slots" DROP COLUMN "emergency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "available_slots" DROP COLUMN "patientGap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "available_slots" DROP COLUMN "slotDuration"`,
    );
  }
}
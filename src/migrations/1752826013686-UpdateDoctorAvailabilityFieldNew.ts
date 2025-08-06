import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorAvailabilityField1752826013686
  implements MigrationInterface
{
  name = 'UpdateDoctorAvailabilityField1752826013686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "doctors" DROP COLUMN "availability"
    `);
    await queryRunner.query(`
      ALTER TABLE "doctors"
      ADD "availability" json NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      ALTER TABLE "patients" ADD "email" character varying
    `);
    await queryRunner.query(`
      UPDATE "patients" SET "email" = 'placeholder@example.com' WHERE "email" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "patients" ALTER COLUMN "email" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients" DROP COLUMN "email"
    `);
    await queryRunner.query(`
      ALTER TABLE "doctors" DROP COLUMN "availability"
    `);
    await queryRunner.query(`
      ALTER TABLE "doctors" ADD "availability" json
    `);
  }
}
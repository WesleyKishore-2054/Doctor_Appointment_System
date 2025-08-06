import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorAvailabilityJson1752925708484
  implements MigrationInterface
{
  name = 'UpdateDoctorAvailabilityJson1752925708484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "doctors" ALTER COLUMN "availability" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ALTER COLUMN "availability" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" ALTER COLUMN "availability" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ALTER COLUMN "availability" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD "email" character varying NOT NULL`,
    );
  }
}
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDoctorEntity1752655065766 implements MigrationInterface {
  name = 'AddDoctorEntity1752655065766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "UQ_62069f52ebba471c91de5d59d61"`,);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "doctors" ADD "qualification" character varying NOT NULL`,);
    await queryRunner.query(`ALTER TABLE "doctors" ADD "experience" integer NOT NULL`,);
    await queryRunner.query(  `ALTER TABLE "doctors" ADD "clinicAddress" character varying NOT NULL`,);
    await queryRunner.query(  `ALTER TABLE "doctors" ADD "availability" character varying NOT NULL`,);
    await queryRunner.query(`ALTER TABLE "doctors" ADD "userId" integer`);
    await queryRunner.query(  `ALTER TABLE "doctors" ADD CONSTRAINT "FK_55651e05e46413d510215535edf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP CONSTRAINT "FK_55651e05e46413d510215535edf"`,
    );
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "availability"`);
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP COLUMN "clinicAddress"`,
    );
    await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "experience"`);
    await queryRunner.query(
      `ALTER TABLE "doctors" DROP COLUMN "qualification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "phone" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "email" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD CONSTRAINT "UQ_62069f52ebba471c91de5d59d61" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctors" ADD "name" character varying NOT NULL`,
    );
  }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePatientEntity1752660468478 implements MigrationInterface {
    name = 'UpdatePatientEntity1752660468478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "UQ_64e2031265399f5690b0beba6a5"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "gender" character varying`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "age" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "bloodGroup" character varying`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "medicalHistory" text`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "medicalHistory"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "bloodGroup"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email")`);
    }

}

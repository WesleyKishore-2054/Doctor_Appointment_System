import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWaveGapinAvailableSlotTable1753085327099 implements MigrationInterface {
    name = 'AddWaveGapinAvailableSlotTable1753085327099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "available_slots" ADD "waveGap" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "available_slots" DROP COLUMN "waveGap"`);
    }

}
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWaveEnhancementInSlotCreation1753084798298 implements MigrationInterface {
    name = 'AddWaveEnhancementInSlotCreation1753084798298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "available_slots" ADD "groupSize" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "available_slots" DROP COLUMN "groupSize"`);
    }

}
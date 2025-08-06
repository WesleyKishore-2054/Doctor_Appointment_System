import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRefreshTokenToUsers1752645559869 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'refreshToken',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'refreshToken');
  }
}
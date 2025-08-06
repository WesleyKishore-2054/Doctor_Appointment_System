import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'wesleyMsd07***',
  database: 'postgres',
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
});

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: true, // For development only
});

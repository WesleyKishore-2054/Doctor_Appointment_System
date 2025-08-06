import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://wesley_kishore:Jn07hrTbvuFGm1aOQJuKluBEF2Zvb8eq@dpg-d29i6q2li9vc73fosa50-a.oregon-postgres.render.com/backend_db_wesley',
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: true, 
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
});

# NestJS + TypeORM + PostgreSQL Integration

This project connects a NestJS backend to a PostgreSQL database using TypeORM with migrations (no direct sync). Entity files were created for `User`, `Doctor`, and `Patient`. A migration was generated and executed successfully to create the respective tables in the database.

Key steps completed:
- Configured TypeORM with PostgreSQL in both `app.module.ts` and `data-source.ts`
- Disabled auto schema synchronization (`synchronize: false`) to use migrations
- Created entity files:
  - `user.entity.ts`
  - `doctor.entity.ts`
  - `patient.entity.ts`
- Generated a migration using `npx typeorm migration:generate`
- Ran the migration using `npx typeorm migration:run`
- Verified that the tables were created in the connected PostgreSQL instance



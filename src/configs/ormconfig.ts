import { ConnectionOptions } from 'typeorm'
import 'reflect-metadata'

export const connectionConfigs: ConnectionOptions = {
  type: 'postgres',
  logging: false,
  synchronize: false,
  entities: ['src/models/*{.ts,.js}'],
  migrations: ['src/models/migrations/*{.ts,.js}'],
  database: process.env.POSTGRES_DB_NAME,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || '5432'),
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/models/migrations',
  },
}

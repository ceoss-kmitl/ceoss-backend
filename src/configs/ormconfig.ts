import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const options: ConnectionOptions = {
  type: 'postgres',
  logging: false,
  synchronize: false,
  entities: ['src/models/*{.ts,.js}'],
  migrations: ['src/models/migrations/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/models/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
  database: process.env.POSTGRES_DB_NAME,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || '5432'),
}

export const connectionConfigs: ConnectionOptions = options

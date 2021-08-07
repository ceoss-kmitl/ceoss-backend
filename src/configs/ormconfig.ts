import { ConnectionOptions } from 'typeorm'

const isProduction = process.env.NODE_ENV === 'production'

const elephantSQLConfigs = {
  url: process.env.ELEPHANTSQL_URL,
}

const localConfigs = {
  database: process.env.POSTGRES_DB_NAME,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || '5432'),
}

const defaultConfigs: ConnectionOptions = {
  type: 'postgres',
  logging: false,
  synchronize: false,
  entities: ['src/models/*{.ts,.js}'],
  migrations: ['src/models/migrations/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/models/migrations',
  },
}

export const connectionConfigs: ConnectionOptions = isProduction
  ? {
      ...defaultConfigs,
      ...elephantSQLConfigs,
    }
  : {
      ...defaultConfigs,
      ...localConfigs,
    }

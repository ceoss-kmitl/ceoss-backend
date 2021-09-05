import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const isDevelopment = process.env.NODE_ENV === 'development'

const rootDir = isDevelopment ? 'src' : 'build'

const productionConfigs = {
  url: process.env.DATABASE_URL,
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
  entities: [rootDir + '/models/*{.ts,.js}'],
  migrations: [rootDir + '/models/migrations/*{.ts,.js}'],
  cli: {
    entitiesDir: rootDir + '/models',
    migrationsDir: rootDir + '/models/migrations',
  },
  namingStrategy: new SnakeNamingStrategy(),
}

export const connectionConfigs: ConnectionOptions = isDevelopment
  ? {
      ...defaultConfigs,
      ...localConfigs,
    }
  : {
      ...defaultConfigs,
      ...productionConfigs,
    }

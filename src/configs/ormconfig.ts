import { ConnectionOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const isProduction = process.env.NODE_ENV === 'production'

const rootDir = isProduction ? 'build' : 'src'

const configs: ConnectionOptions = {
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
  database: process.env.POSTGRES_DB_NAME,
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || '5432'),
}

export const connectionConfigs: ConnectionOptions = configs

import { createConnection } from 'typeorm'
import { connectionConfigs } from '@configs/ormconfig'
import { Logger } from '@middlewares/logger'

async function connect() {
  try {
    await createConnection(connectionConfigs)
    Logger.info('Database connected')
  } catch (err) {
    Logger.error('Can not connect to database', err)
    process.exit(1)
  }
}

export const Database = {
  connect,
}

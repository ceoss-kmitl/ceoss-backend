import { createConnection } from 'typeorm'
import { Logger } from '@configs/logger'

import connectionConfigs = require('@configs/ormconfig')

async function connect() {
  try {
    await createConnection(connectionConfigs)
    Logger.info('Database connected')
  } catch (err) {
    Logger.error('Can not connect to database')
    process.exit(1)
  }
}

export const Database = {
  connect,
}

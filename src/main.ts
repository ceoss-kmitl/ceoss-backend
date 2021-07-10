import 'dotenv/config'
import { Database } from '@configs/database'
import { Server } from '@configs/server'

async function init() {
  await Database.connect()
  Server.setupDefaultMiddlewares()
  Server.setupAPIs()
  Server.start()
}

init()

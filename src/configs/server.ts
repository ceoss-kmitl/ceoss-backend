import Express from 'express'
import Cors from 'cors'
import { ServerLogger, Logger } from '@configs/logger'
import { APIs } from '@middlewares/api'
import { ErrorHandler } from '@middlewares/errorHandler'

const port = process.env.PORT || 5050
const app = Express()

function setupDefaultMiddlewares() {
  app.use(ServerLogger())
  app.use(Cors())
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))
  app.use('/ping', (_, res) => res.send({ hello: 'world' }))
}

function setupAPIs() {
  app.use('/api', APIs())
  app.use(ErrorHandler())
}

function start() {
  app.listen(port, () => {
    Logger.info(`Server has started on port ${port}`)
  })
}

export const Server = {
  setupDefaultMiddlewares,
  setupAPIs,
  start,
}

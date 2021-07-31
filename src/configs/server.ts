import Path from 'path'
import Express from 'express'
import { useExpressServer } from 'routing-controllers'
import { Database } from '@configs/database'
import { ServerLogger, Logger } from '@middlewares/logger'
import { ErrorHandler } from '@middlewares/errorHandler'

export class Server {
  private app: Express.Application
  private port: number

  constructor() {
    this.app = Express()
    this.port = Number(process.env.PORT) || 5050
  }

  private async setupDatabase() {
    await Database.connect()
  }

  private setupDefaultMiddleware() {
    this.app.use(ServerLogger())
    this.app.use(Express.json())
    this.app.use(Express.urlencoded({ extended: true }))
    this.app.use('/ping', (_, res) => res.send({ hello: 'world' }))
  }

  private setupRouting() {
    const controllerPath = Path.join(__dirname, '../controllers/*.ts')
    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [controllerPath],
      defaultErrorHandler: false,
    })
  }

  private setupErrorHandler() {
    this.app.use(ErrorHandler())
  }

  private openPort() {
    this.app.listen(this.port, () => {
      Logger.info(`Server has started on port ${this.port}`)
    })
  }

  public async start() {
    await this.setupDatabase()
    this.setupDefaultMiddleware()
    this.setupRouting()
    this.setupErrorHandler()
    this.openPort()
  }
}

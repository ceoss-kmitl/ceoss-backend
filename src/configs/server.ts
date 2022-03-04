import Path from 'path'
import Express from 'express'
import { useExpressServer } from 'routing-controllers'
import { get } from 'lodash'

import { Database } from '@configs/database'
import { createOAuthInstance } from '@configs/oauth'
import { ServerLogger, Logger } from '@middlewares/logger'
import { ErrorHandler } from '@middlewares/errorHandler'
import { Account } from '@models/account'

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
    const controllerPath = Path.join(__dirname, '../controllers/*.{ts,js}')
    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [controllerPath],
      defaultErrorHandler: false,
      cors: true,
      authorizationChecker: async (action) => {
        const headers = action.request.headers
        const auth: string = headers['authorization'] || ''
        const deviceId: string = headers['ceoss-device-id'] || ''
        const accessToken = get(auth.split(' '), 1, '')

        try {
          const OAuth = createOAuthInstance()
          const tokenInfo = await OAuth.getTokenInfo(accessToken)
          const account = await Account.findOne({
            where: {
              email: tokenInfo.email,
              deviceId,
            },
          })
          if (!account) return false

          action.request.user = account
          return true
        } catch (error) {
          return false
        }
      },
      currentUserChecker: async (action) => action.request.user,
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

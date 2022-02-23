import Path from 'path'
import Fetch from 'node-fetch'
import Express from 'express'
import { OAuth2Client } from 'google-auth-library'
import { useExpressServer } from 'routing-controllers'
import { get } from 'lodash'

import { Database } from '@configs/database'
import { ServerLogger, Logger } from '@middlewares/logger'
import { ErrorHandler } from '@middlewares/errorHandler'
import { Account } from '@models/account'

export class Server {
  private app: Express.Application
  private port: number

  static oAuth2: OAuth2Client

  constructor() {
    this.app = Express()
    this.port = Number(process.env.PORT) || 5050
    Server.oAuth2 = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
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
        const auth: string = action.request.headers['authorization'] || ''
        const accessToken = get(auth.split(' '), 1, '')
        try {
          const res = await Fetch(
            `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
          )
          const googleData = await res.json()
          const user = await Account.findOneOrCreate({
            email: googleData.email || '',
            accessToken,
          })
          action.request.user = user
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

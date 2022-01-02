import 'dotenv/config'
import 'reflect-metadata'
import { Server } from '@configs/server'

import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th', { weekStart: 1 })
dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(buddhistEra)

const server = new Server()
server.start()

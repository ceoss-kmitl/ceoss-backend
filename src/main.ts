import 'dotenv/config'
import 'reflect-metadata'
import { Server } from '@configs/server'

const server = new Server()
server.start()

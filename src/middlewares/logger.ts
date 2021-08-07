import Morgan from 'morgan'
import Chalk from 'chalk'

function colorize(method = '') {
  switch (method) {
    case 'GET':
      return Chalk.greenBright
    case 'POST':
      return Chalk.blueBright
    case 'PUT':
      return Chalk.yellowBright
    case 'DELETE':
      return Chalk.redBright
    default:
      return Chalk.whiteBright
  }
}

function now() {
  const date = new Date()
  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function createLogger(chalk: string, ...message: any) {
  return console.log(Chalk.grey(now()), chalk, ...message)
}

export const ServerLogger = () =>
  Morgan((tokens, req, res) =>
    [
      Chalk.grey(now()),
      colorize(req.method).bold(tokens.method(req, res)),
      Chalk.magenta(tokens.status(req, res)),
      Chalk.white(tokens.url(req, res)),
    ].join(' ')
  )

export const Logger = {
  info(...message: any) {
    return createLogger(Chalk.cyanBright.bold('[INFO]'), ...message)
  },
  debug(...message: any) {
    return createLogger(Chalk.magentaBright.bold('[DEBUG]'), ...message)
  },
  error(...message: any) {
    return createLogger(Chalk.redBright.bold('[ERROR]'), ...message)
  },
}

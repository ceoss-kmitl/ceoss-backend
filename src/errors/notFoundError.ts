import { BaseError } from '@errors/baseError'

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super({
      statusCode: 404,
      name: 'NotFoundError',
      message,
    })
  }
}

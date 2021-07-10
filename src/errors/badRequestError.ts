import { BaseError } from '@errors/baseError'

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super({
      statusCode: 400,
      name: 'BadRequestError',
      message,
    })
  }
}

import { BaseError } from '@errors/baseError'

export class ValidationError extends BaseError {
  constructor(message: string) {
    super({
      statusCode: 400,
      name: 'ValidationError',
      message,
    })
  }
}

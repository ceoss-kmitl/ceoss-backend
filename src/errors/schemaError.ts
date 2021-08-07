import { BaseError } from '@errors/baseError'

export class SchemaError extends BaseError {
  constructor(message: string) {
    super({
      statusCode: 400,
      name: 'SchemaError',
      message,
    })
  }
}

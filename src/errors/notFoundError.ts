import { BaseError } from '@errors/baseError'

export class AccountNotFoundError extends BaseError {
  constructor(id: string) {
    super({
      statusCode: 404,
      name: 'AccountNotFoundError',
      message: `Account ${id} is not found`,
    })
  }
}

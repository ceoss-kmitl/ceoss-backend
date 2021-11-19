import { BaseError } from '@errors/baseError'

export class InternalServerError extends BaseError {
  constructor(error: any) {
    const errorName = error.name ?? 'UnknownError'
    super({
      statusCode: 500,
      name: `InternalServerError(${errorName})`,
      message: `มีข้อผิดพลาดบางอย่างเกิดขึ้น`,
      errorList: [error.message],
    })
  }
}

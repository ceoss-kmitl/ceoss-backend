import { BaseError } from '@errors/baseError'

export class RelationError extends BaseError {
  constructor(relationName: string) {
    super({
      statusCode: 500,
      name: `RelationError`,
      message: `มีข้อผิดพลาดบางอย่างเกิดขึ้น`,
      errorList: [
        `You need to join relation with (${relationName}) to use this function`,
      ],
    })
  }
}

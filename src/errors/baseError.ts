export class BaseError extends Error {
  public statusCode: number
  public name: string
  public message: string
  public errorList: string[]

  constructor({ statusCode, name, message, errorList }: BaseError) {
    super(message)
    this.statusCode = statusCode
    this.name = name
    this.message = message
    this.errorList = errorList
  }
}

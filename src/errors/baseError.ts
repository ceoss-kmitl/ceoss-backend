export class BaseError extends Error {
  public statusCode: number
  public name: string
  public message: string

  constructor({ statusCode, name, message }: BaseError) {
    super(message)
    this.statusCode = statusCode
    this.name = name
    this.message = message
  }
}

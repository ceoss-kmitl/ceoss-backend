import { ErrorRequestHandler } from 'express'
import { BaseError } from '@errors/baseError'
import { InternalServerError } from '@errors/internalServerError'

export const ErrorHandler =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (): ErrorRequestHandler => (error: BaseError, req, res, next) => {
    if (error.statusCode) {
      return res.status(error.statusCode).send({
        name: error.name,
        message: error.message,
        errorList: error.errorList,
      })
    }

    if ((error as any).httpCode) {
      return res.status((error as any).httpCode).send({
        name: error.name,
        message: error.message,
        errorList: error.errorList,
      })
    }

    const err = new InternalServerError(error)
    return res.status(err.statusCode).send({
      name: err.name,
      message: err.message,
      errorList: err.errorList,
    })
  }

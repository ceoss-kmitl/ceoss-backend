import { Handler } from 'express'

export const asyncWrapper =
  (handler: Handler): Handler =>
  async (req, res, next) => {
    try {
      const data = await Promise.resolve(handler(req, res, next))
      res.send({ data })
    } catch (error) {
      next(error)
    }
  }

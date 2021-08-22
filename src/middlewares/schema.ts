import { Handler } from 'express'
import { validateSync, ValidationError as Error } from 'class-validator'
import { plainToClass, classToPlain } from 'class-transformer'
import { SchemaError } from '@errors/schemaError'

export const schema =
  (schema: any, type: 'body' | 'query' = 'body'): Handler =>
  (req, res, next) => {
    const errors: Error[] = validateSync(plainToClass(schema, req[type]), {
      whitelist: true,
      forbidNonWhitelisted: true,
    })

    if (errors.length > 0) {
      let resultArray: string[] = []
      const plainErrors = classToPlain(errors)

      plainErrors.forEach((each: any) => {
        if (each.children?.length) {
          each.children.forEach((child: any) => {
            const errorArray: string[] = Object.values(child.constraints)
            resultArray = resultArray.concat(errorArray)
          })
        } else {
          const errorArray: string[] = Object.values(each.constraints)
          resultArray = resultArray.concat(errorArray)
        }
      })

      const message = resultArray.join(', ')
      next(new SchemaError(message))
    }
    next()
  }

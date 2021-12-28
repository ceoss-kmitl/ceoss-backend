import { UseBefore } from 'routing-controllers'

import { schema } from './schema'

export const ValidateBody = <T>(bodyClass: T) =>
  UseBefore(schema(bodyClass, 'body'))

export const ValidateQuery = <T>(queryClass: T) =>
  UseBefore(schema(queryClass, 'query'))

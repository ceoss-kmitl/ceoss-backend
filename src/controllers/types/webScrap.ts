import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class IWebScrapQuery {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

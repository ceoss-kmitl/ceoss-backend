import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class IAcademicTime {
  @Type(() => Number)
  @IsNumber()
  academicYear: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

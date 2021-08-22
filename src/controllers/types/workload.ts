import { Type } from 'class-transformer'
import { IsNumber, IsString } from 'class-validator'

export class ITeacherWorkloadQuery {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

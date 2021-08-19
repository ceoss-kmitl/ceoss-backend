import { Type } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class ICreateTeacher {
  @IsString()
  name: string

  @IsString()
  title: string

  @IsBoolean()
  isExecutive: boolean

  @IsBoolean()
  isActive: boolean
}

export class IEditTeacher {
  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  title: string

  @IsBoolean()
  @IsOptional()
  isExecutive: boolean

  @IsBoolean()
  @IsOptional()
  isActive: boolean
}

export class ITeacherWorkloadQuery {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

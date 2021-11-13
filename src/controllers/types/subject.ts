import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

export class ICreateSubject {
  @IsString()
  code: string

  @IsString()
  name: string

  @IsBoolean()
  isRequired: boolean

  @IsNumber()
  credit: number

  @IsNumber()
  lectureHours: number

  @IsNumber()
  labHours: number

  @IsNumber()
  independentHours: number

  @IsString()
  curriculumCode: string

  @IsBoolean()
  isInter: boolean
}

export class IEditSubject {
  @IsString()
  @IsOptional()
  code: string

  @IsString()
  @IsOptional()
  name: string

  @IsBoolean()
  @IsOptional()
  isRequired: boolean

  @IsNumber()
  @IsOptional()
  credit: number

  @IsNumber()
  @IsOptional()
  lectureHours: number

  @IsNumber()
  @IsOptional()
  labHours: number

  @IsNumber()
  @IsOptional()
  independentHours: number

  @IsString()
  @IsOptional()
  curriculumCode: string

  @IsBoolean()
  @IsOptional()
  isInter: boolean
}

export class IGetSubjectCompensatedQuery {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

export class IPostSubjectCompensatedBody {
  @IsNumber()
  section: number

  @IsNumber()
  academicYear: number

  @IsNumber()
  semester: number

  @IsString()
  @IsOptional()
  roomId?: string

  @IsDateString()
  originalDate: string

  @IsArray({ each: true })
  originalTimeList: string[][]

  @IsDateString()
  compensatedDate: string

  @IsArray({ each: true })
  compensatedTimeList: string[][]
}

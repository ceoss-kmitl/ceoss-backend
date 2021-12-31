import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class ICreateSubject {
  @Transform(({ value }) => value?.trim())
  @IsNumberString()
  @Length(8, 8)
  code: string

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  name: string

  @IsBoolean()
  @IsOptional()
  isRequired = true

  @IsNumber()
  credit: number

  @IsNumber()
  lectureHours: number

  @IsNumber()
  labHours: number

  @IsNumber()
  independentHours: number

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  @IsOptional()
  curriculumCode = 'CE'

  @IsBoolean()
  @IsOptional()
  isInter = false
}

export class IEditSubject {
  @Transform(({ value }) => value?.trim())
  @IsNumberString()
  @Length(8, 8)
  @IsOptional()
  code?: string

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  @IsOptional()
  name?: string

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean

  @IsNumber()
  @IsOptional()
  credit?: number

  @IsNumber()
  @IsOptional()
  lectureHours?: number

  @IsNumber()
  @IsOptional()
  labHours?: number

  @IsNumber()
  @IsOptional()
  independentHours?: number

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  @IsOptional()
  curriculumCode?: string

  @IsBoolean()
  @IsOptional()
  isInter?: boolean
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

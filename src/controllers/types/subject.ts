import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

import { IAcademicTime } from './common'

// ==================
// Subject x Workload
// ==================

export class IGetSubjectCompensationWorkloadQuery extends IAcademicTime {}

export class ICreateSubjectCompensationWorkloadBody {
  @IsString()
  @IsOptional()
  roomId?: string

  @IsString()
  originalWorkloadId: string

  @IsDateString()
  originalDate: string

  @Type(() => Date)
  @IsDate()
  compensatedDate: Date

  @IsArray({ each: true })
  compensatedTimeList: string[][]
}

// =========
// CRUD type
// =========

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

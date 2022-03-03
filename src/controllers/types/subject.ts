import { Transform, Type } from 'class-transformer'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

import { DocumentPattern } from '@constants/common'

import { IAcademicTime } from './common'

// =============
// Subject Excel
// =============

export class IDownloadAssistantExcelQuery extends IAcademicTime {
  @IsDateString()
  documentDate: string

  @IsEnum(DocumentPattern)
  documentPattern: DocumentPattern

  @IsString()
  approvalNumber: string

  @IsDateString()
  approvalDate: string

  @IsString()
  teacherId: string
}

// ==================
// Subject x Workload
// ==================

export class IGetSubjectCompensationWorkloadQuery extends IAcademicTime {}

// ==================
// Subject x Section
// ==================

export class IGetSubjectSectionInfoQuery extends IAcademicTime {}

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

  @Type(() => Number)
  @IsNumber()
  credit: number

  @Type(() => Number)
  @IsNumber()
  lectureHours: number

  @Type(() => Number)
  @IsNumber()
  labHours: number

  @Type(() => Number)
  @IsNumber()
  independentHours: number

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  @IsOptional()
  curriculumCode = 'CE'

  @IsBoolean()
  @IsOptional()
  isInter = false

  @IsBoolean()
  @IsOptional()
  requiredRoom = true
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

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  credit?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lectureHours?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  labHours?: number

  @Type(() => Number)
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

  @IsBoolean()
  @IsOptional()
  requiredRoom?: boolean
}

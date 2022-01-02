import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { DayOfWeek, Degree, WorkloadType } from '@constants/common'

import { IAcademicTime } from './common'

// ==================
// Teacher x Workload
// ==================

export class IGetTeacherWorkloadQuery extends IAcademicTime {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  compensation?: boolean
}

export interface IGetTeacherWorkloadResponse {
  workloadList: {
    id: string
    subjectId: string
    roomId?: string
    code: string
    name: string
    section: number
    type: WorkloadType
    fieldOfStudy: string
    degree: Degree
    classYear: number
    dayOfWeek: DayOfWeek
    startSlot: number
    endSlot: number
    timeList: { start: string; end: string }[]
    teacherList: {
      teacherId: string
      weekCount: number
      isClaim: boolean
    }[]
    isClaim: boolean
  }[]
}

// =========
// CRUD type
// =========

export class ICreateTeacher {
  @Transform(({ value }) => value?.trim())
  @IsString()
  name: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  title: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  executiveRole = ''

  @IsBoolean()
  @IsOptional()
  isActive = true

  @IsBoolean()
  @IsOptional()
  isExternal = false
}

export class IEditTeacher {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  name?: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  title?: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  executiveRole?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean
}

export class IGetTeacherQuery {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

// =============
// Teacher Excel
// =============

export class IDownloadTeacherWorkloadExcelQuery extends IAcademicTime {}

class IDayExcelExternal {
  @Type(() => Number)
  @IsNumber()
  day: number

  // Can not use `@Type Boolean` like others
  // Not sure why :(
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isCompensated: boolean

  @IsString()
  remark: string
}

class IWorkloadExcelExternal {
  @IsString()
  workloadId: string

  @Type(() => IDayExcelExternal)
  @IsArray()
  @ValidateNested({ each: true })
  dayList: IDayExcelExternal[]
}

export class IDownloadExtTeacherWorkloadExcelQuery extends IAcademicTime {
  @IsString()
  month: string

  @Type(() => IWorkloadExcelExternal)
  @IsArray()
  @ValidateNested({ each: true })
  workloadList: IWorkloadExcelExternal[]
}

import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { DayOfWeek, Degree, WorkloadType } from '@constants/common'

// ============
// Request type
// ============

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
// Response type
// =============

export interface IGetTeacherWorkloadResponse {
  workloadList: {
    id: string
    subjectId: string
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

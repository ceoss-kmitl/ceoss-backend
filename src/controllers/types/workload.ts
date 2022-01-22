import { DayOfWeek, Degree, WorkloadType } from '@constants/common'
import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

import { IAcademicTime } from './common'

// =======================
// Workload x Compensation
// =======================

export class ICreateCompensationWorkloadBody {
  @IsString()
  @IsOptional()
  roomId?: string

  @Type(() => Date)
  @IsDate()
  originalDate: Date

  @Type(() => Date)
  @IsDate()
  compensatedDate: Date

  @IsArray({ each: true })
  compensatedTimeList: string[][]
}

// ====================
// Workload x Assistant
// ====================
class IAssitantWorkloadList {
  @IsString()
  assistantId: string

  @IsString()
  assistantName: string

  @IsArray()
  @IsString({ each: true })
  dayList: string[]
}

export class IEditAssistantOfWorkload {
  @Type(() => IAssitantWorkloadList)
  @IsArray()
  @ValidateNested({ each: true })
  list: IAssitantWorkloadList[]
}

// =========
// CRUD type
// =========

export class IGetWorkloadQuery extends IAcademicTime {
  @IsString()
  @IsOptional()
  room?: string

  @IsString()
  @IsOptional()
  subject?: string

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  compensation?: boolean
}

class ITeacherList {
  @IsString()
  teacherId: string

  @IsNumber()
  weekCount: number

  @IsBoolean()
  isClaim: boolean
}

export class ICreateWorkload {
  @Type(() => ITeacherList)
  @IsArray()
  @ValidateNested({ each: true })
  teacherList: ITeacherList[]

  @IsString()
  subjectId: string

  @IsNumber()
  section: number

  @IsEnum(WorkloadType)
  type: WorkloadType

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek

  @IsArray({ each: true })
  timeList: string[][]

  @IsString()
  @IsOptional()
  roomId?: string

  @IsNumber()
  academicYear: number

  @IsNumber()
  semester: number

  @IsEnum(Degree)
  degree: Degree

  @Transform(({ value }) => value?.trim()?.toUpperCase())
  @IsString()
  fieldOfStudy: string

  @IsNumber()
  classYear: number
}

class IEditWorkloadTeacherList {
  @IsString()
  teacherId: string

  @IsNumber()
  weekCount: number

  @IsBoolean()
  isClaim: boolean
}

export class IEditWorkload {
  @Type(() => IEditWorkloadTeacherList)
  @ValidateNested({ each: true })
  @IsArray()
  teacherList: IEditWorkloadTeacherList[]
}

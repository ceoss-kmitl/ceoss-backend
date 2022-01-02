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

// ==============
// Workload Excel
// ==============

export class IDownloadTeacherWorkloadExcelQuery extends IAcademicTime {}

class IDayExcelExternal {
  @IsNumber()
  day: number

  @IsBoolean()
  isCompensated: boolean

  @IsString()
  remark: string
}

class IWorkloadExcelExternal {
  @IsString()
  workloadId: string

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => IDayExcelExternal)
  dayList: IDayExcelExternal[]
}

export class IBodyExcelExternal {
  @IsString()
  month: string

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => IWorkloadExcelExternal)
  workloadList: IWorkloadExcelExternal[]
}

export class IGetWorkloadExcel5Query {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

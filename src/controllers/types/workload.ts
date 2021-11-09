import { DayOfWeek, Degree, WorkloadType } from '@models/workload'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class ITeacherWorkloadQuery {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
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

export class IGetWorkloadExcelQuery {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

export class IBodyExcelExternal {
  @IsString()
  month: string

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => IWorkloadExcelExternal)
  workloadList: IWorkloadExcelExternal[]
}

class IWorkloadExcelExternal {
  @IsString()
  workloadId: string

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => IDayExcelExternal)
  dayList: IDayExcelExternal[]
}

class IDayExcelExternal {
  @IsNumber()
  day: number

  @IsBoolean()
  isCompensated: boolean

  @IsString()
  remark: string
}

export class IGetWorkloadExcel5Query {
  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

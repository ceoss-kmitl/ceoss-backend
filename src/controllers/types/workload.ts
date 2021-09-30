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
  @IsString()
  teacher_id: string

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

export class IGetWorkloadExcel1Query {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

export class IGetWorkloadExcel2Query {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

export class IGetWorkloadExcel3Query {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

export class IGetWorkloadExcel3OutQuery {
  @IsString()
  teacher_id: string

  @Type(() => Number)
  @IsNumber()
  academic_year: number

  @Type(() => Number)
  @IsNumber()
  semester: number
}

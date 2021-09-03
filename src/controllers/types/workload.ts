import { DayOfWeek, WorkloadType } from '@models/workload'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
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

const TIME_REGEX = /^\d{2}:\d{2}$/ // hh:mm, 08:30, 12:05

export class IWorkloadTime {
  @IsString()
  @Matches(TIME_REGEX)
  startTime: string

  @IsString()
  @Matches(TIME_REGEX)
  endTime: string
}

export class ICreateWorkload {
  @IsString()
  teacherId: string

  @IsString()
  subjectId: string

  @IsNumber()
  section: number

  @IsEnum(WorkloadType)
  type: WorkloadType

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek

  @ValidateNested()
  timeList: IWorkloadTime[]

  @IsString()
  @IsOptional()
  roomId: string

  @IsBoolean()
  isCompensated: boolean

  @IsNumber()
  academicYear: number

  @IsNumber()
  semester: number

  @IsString()
  fieldOfStudy: string

  @IsNumber()
  classYear: number
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

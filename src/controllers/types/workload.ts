import { DayOfWeek, WorkloadType } from '@models/workload'
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

const TIME_REGEX = /^\d{2}:\d{2}$/ // hh:mm, 08:30, 12:05

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

  @IsString()
  @Matches(TIME_REGEX)
  startTime: string

  @IsString()
  @Matches(TIME_REGEX)
  endTime: string

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
}

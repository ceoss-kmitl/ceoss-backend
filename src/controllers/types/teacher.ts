import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { DayOfWeek, WorkloadType } from '@models/workload'

export class ICreateTeacher {
  @IsString()
  name: string

  @IsString()
  title: string

  @IsBoolean()
  isExecutive: boolean
}

export class IEditTeacher {
  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  title: string

  @IsBoolean()
  @IsOptional()
  isExecutive: boolean
}

export interface ITeacherWorkload {
  dayInWeek: DayOfWeek
  subjectList: {
    id: string
    workloadId: string
    code: string
    name: string
    section: number
    startSlot: number
    endSlot: number
    type: WorkloadType
  }[]
}

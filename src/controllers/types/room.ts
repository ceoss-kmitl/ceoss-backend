import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

import { IAcademicTime } from './common'

// ============
// Request type
// ============

export class ICreateRoom {
  @Transform(({ value }) => value?.trim())
  @IsString()
  name: string

  @IsNumber()
  capacity: number
}

export class IEditRoom {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  name?: string

  @IsNumber()
  @IsOptional()
  capacity?: number
}

export class IGetRoomWorkloadQuery extends IAcademicTime {}

export class IAssignWorkloadToRoom {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workloadIdList?: string[]
}

export class IAutoAssignWorkloadToRoomQuery {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number
}

export class IResetRoomWorkloadQuery {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number
}

export class IGetRoomExcelQuery {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number
}

export class IGetAvailableRoomCompensated {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number

  @IsDateString()
  compensatedDate: string

  @Matches(/\d\d\:\d\d/)
  @IsString()
  startTime: string

  @Matches(/\d\d\:\d\d/)
  @IsString()
  endTime: string
}

// =============
// Response type
// =============

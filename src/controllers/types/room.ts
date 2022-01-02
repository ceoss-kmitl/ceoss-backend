import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

import { IAcademicTime } from './common'

// =========
// CRUD type
// =========

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

// ==========
// Room Excel
// ==========

export class IGetRoomExcelQuery extends IAcademicTime {}

// ===============
// Room x Workload
// ===============

export class IGetAvailableRoom extends IAcademicTime {
  @Type(() => Date)
  @IsDate()
  compensatedDate: Date

  @Matches(/\d\d\:\d\d/)
  @IsString()
  startTime: string

  @Matches(/\d\d\:\d\d/)
  @IsString()
  endTime: string
}

export class IGetRoomWorkloadQuery extends IAcademicTime {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  compensation?: boolean
}

export class IAssignWorkloadToRoom {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workloadIdList?: string[]
}

// ===========
// Room Action
// ===========

export class IAutoAssignWorkloadToRoomQuery extends IAcademicTime {}

export class IResetRoomWorkloadQuery extends IAcademicTime {}

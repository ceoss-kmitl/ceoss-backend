import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class ICreateRoom {
  @IsString()
  name: string

  @IsNumber()
  capacity: number
}

export class IEditRoom {
  @IsString()
  @IsOptional()
  name?: string

  @IsNumber()
  @IsOptional()
  capacity?: number
}

export class IGetRoomWorkloadQuery {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number
}

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

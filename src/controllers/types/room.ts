import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class ICreateRoom {
  @IsString()
  name: string

  @IsNumber()
  capacity: number
}

export class IEditRoom {
  @IsString()
  @IsOptional()
  name: string

  @IsNumber()
  @IsOptional()
  capacity: number
}

export class IGetRoomWorkloadQuery {
  @IsNumber()
  @Type(() => Number)
  academic_year: number

  @IsNumber()
  @Type(() => Number)
  semester: number
}

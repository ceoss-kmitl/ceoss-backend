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

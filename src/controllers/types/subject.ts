import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'

export class ICreateSubject {
  @IsString()
  code: string

  @IsString()
  name: string

  @IsBoolean()
  isRequired: boolean

  @IsNumber()
  credit: number

  @IsNumber()
  lectureHours: number

  @IsNumber()
  labHours: number

  @IsNumber()
  independentHours: number
}

export class IEditSubject {
  @IsString()
  @IsOptional()
  code: string

  @IsString()
  @IsOptional()
  name: string

  @IsBoolean()
  @IsOptional()
  isRequired: boolean

  @IsNumber()
  @IsOptional()
  credit: number

  @IsNumber()
  @IsOptional()
  lectureHours: number

  @IsNumber()
  @IsOptional()
  labHours: number

  @IsNumber()
  @IsOptional()
  independentHours: number
}

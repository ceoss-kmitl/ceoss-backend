import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ICreateTeacher {
  @IsString()
  name: string

  @IsString()
  title: string

  @IsBoolean()
  isExecutive: boolean

  @IsBoolean()
  isActive: boolean
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

  @IsBoolean()
  @IsOptional()
  isActive: boolean
}

export class IGetTeacherQuery {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_active: boolean
}

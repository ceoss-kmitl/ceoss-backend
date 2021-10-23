import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ICreateTeacher {
  @IsString()
  name: string

  @IsString()
  title: string

  @IsString()
  executiveRole: string

  @IsBoolean()
  isActive: boolean

  @IsBoolean()
  isExternal: boolean
}

export class IEditTeacher {
  @IsString()
  @IsOptional()
  name: string

  @IsString()
  @IsOptional()
  title: string

  @IsString()
  @IsOptional()
  executiveRole: string

  @IsBoolean()
  @IsOptional()
  isActive: boolean

  @IsBoolean()
  @IsOptional()
  isExternal: boolean
}

export class IGetTeacherQuery {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_active: boolean
}

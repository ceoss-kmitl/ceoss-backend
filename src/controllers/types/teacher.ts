import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ICreateTeacher {
  @Transform(({ value }) => value?.trim())
  @IsString()
  name: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  title: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  executiveRole = ''

  @IsBoolean()
  @IsOptional()
  isActive = true

  @IsBoolean()
  @IsOptional()
  isExternal = false
}

export class IEditTeacher {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  name?: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  title?: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  executiveRole?: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsBoolean()
  @IsOptional()
  isExternal?: boolean
}

export class IGetTeacherQuery {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

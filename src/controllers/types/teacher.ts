import { IsBoolean, IsOptional, IsString } from 'class-validator'

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

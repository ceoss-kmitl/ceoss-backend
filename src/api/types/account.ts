import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ICreateAccountRequest {
  @IsString()
  username: string

  @IsString()
  password: string

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean
}

export class IEditAccountRequest {
  @IsString()
  @IsOptional()
  username: string

  @IsString()
  @IsOptional()
  password: string

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean
}

import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ICreateAccount {
  @IsString()
  username: string

  @IsString()
  password: string

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean
}

export class IEditAccount {
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

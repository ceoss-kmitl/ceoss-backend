import { IsString } from 'class-validator'

export class IGoogleLogin {
  @IsString()
  code: string
}

export class IGoogleRefresh {
  @IsString()
  email: string

  @IsString()
  accessToken: string
}

export class IGoogleLogout {
  @IsString()
  email: string

  @IsString()
  accessToken: string
}

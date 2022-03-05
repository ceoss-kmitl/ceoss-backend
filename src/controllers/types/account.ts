import { IsString } from 'class-validator'

export class IGoogleLogin {
  @IsString()
  code: string

  @IsString()
  deviceId: string
}

export class IGoogleRefresh {
  @IsString()
  email: string

  @IsString()
  deviceId: string
}

export class IGoogleLogout {
  @IsString()
  email: string

  @IsString()
  deviceId: string
}

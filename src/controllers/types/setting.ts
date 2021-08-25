import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class IEditSetting {
  @IsString()
  @IsOptional()
  deanName: string

  @IsString()
  @IsOptional()
  headName: string

  @IsNumber()
  @IsOptional()
  lecturePayRate: number

  @IsNumber()
  @IsOptional()
  labPayRate: number

  @IsNumber()
  @IsOptional()
  normalClaimLimit: number

  @IsNumber()
  @IsOptional()
  interClaimLimit: number

  @IsUrl()
  @IsOptional()
  webScrapUrl: string
}

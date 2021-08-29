import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class IEditSetting {
  @IsString()
  @IsOptional()
  deanName: string

  @IsString()
  @IsOptional()
  viceDeanName: string

  @IsString()
  @IsOptional()
  headName: string

  @IsString()
  @IsOptional()
  directorSIIEName: string

  @IsNumber()
  @IsOptional()
  lecturePayRateNormal: number

  @IsNumber()
  @IsOptional()
  labPayRateNormal: number

  @IsNumber()
  @IsOptional()
  lecturePayRateInter: number

  @IsNumber()
  @IsOptional()
  labPayRateInter: number

  @IsNumber()
  @IsOptional()
  lecturePayRateExternal: number

  @IsNumber()
  @IsOptional()
  labPayRateExternal: number

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

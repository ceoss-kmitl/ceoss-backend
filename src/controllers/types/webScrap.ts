import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

import { IAcademicTime } from './common'

export class IWebScrapQuery extends IAcademicTime {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  save?: boolean

  @IsString()
  webId: string
}

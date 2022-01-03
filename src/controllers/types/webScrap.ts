import { Type } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

import { IAcademicTime } from './common'

export class IWebScrapQuery extends IAcademicTime {
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  save?: boolean
}

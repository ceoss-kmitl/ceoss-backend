import { Transform, Type } from 'class-transformer'
import { IsString, ValidateNested } from 'class-validator'

class IWeb {
  @Transform(({ value }) => value?.trim())
  @IsString()
  id: string

  @Transform(({ value }) => value?.trim())
  @IsString()
  url: string
}

export class IUpsertWeb {
  @Type(() => IWeb)
  @ValidateNested({ each: true })
  webList: IWeb[]
}

import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator'

class ISyncTeacher {
  @IsString()
  'ชื่อ-สกุล': string

  @IsString()
  'ตำแหน่งบริหาร': string

  @IsBoolean()
  @Transform(({ value }) => (value === 'x' ? true : false))
  'อาจารย์ภายนอก': boolean
}

export class ISyncTeacherBody {
  @ValidateNested()
  @Type(() => ISyncTeacher)
  @IsArray()
  data: ISyncTeacher[]
}

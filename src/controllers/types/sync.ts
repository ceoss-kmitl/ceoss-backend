import { Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'

class ISyncTeacher {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'ชื่อ-สกุล': string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'ตำแหน่งบริหาร': string

  @IsBoolean()
  @Transform(({ value }) => (value?.trim() === 'x' ? true : false))
  'อาจารย์ภายนอก': boolean
}

class ISyncSubject {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'รหัสวิชา': string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'ชื่อวิชา': string

  @IsBoolean()
  @Transform(({ value }) => (value?.trim() === 'x' ? true : false))
  'วิชาบังคับ': boolean

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'หน่วยกิต': string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'หลักสูตร': string

  @IsBoolean()
  @Transform(({ value }) => (value?.trim() === 'x' ? true : false))
  'นานาชาติ': boolean

  @IsBoolean()
  @Transform(({ value }) => (value?.trim() === 'x' ? true : false))
  'ใช้ห้องเรียน': boolean
}

class ISyncAssistant {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'รหัสวิชา': string

  @IsNumber()
  @Type(() => Number)
  'กลุ่มเรียน': number

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'รหัสนักศึกษา': string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'ชื่อ-สกุล': string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Type(() => String)
  'วันปฏิบัติงาน': string
}

class ISyncRoom {
  @IsString()
  @Type(() => String)
  'ชื่อห้อง': string

  @IsNumber()
  @Type(() => Number)
  'จำนวนที่นั่ง': number
}

export class ISyncTeacherBody {
  @ValidateNested({ each: true })
  @Type(() => ISyncTeacher)
  @IsArray()
  data: ISyncTeacher[]
}

export class ISyncSubjectBody {
  @ValidateNested({ each: true })
  @Type(() => ISyncSubject)
  @IsArray()
  data: ISyncSubject[]
}

export class ISyncRoomBody {
  @ValidateNested({ each: true })
  @Type(() => ISyncRoom)
  @IsArray()
  data: ISyncRoom[]
}

export class ISyncAssistantBody {
  @ValidateNested()
  @Type(() => ISyncAssistant)
  @IsArray()
  data: ISyncAssistant[]
}

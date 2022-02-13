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
  'ชื่อ-สกุล': string

  @IsString()
  'ตำแหน่งบริหาร': string

  @IsBoolean()
  @Transform(({ value }) => (value === 'x' ? true : false))
  'อาจารย์ภายนอก': boolean
}

class ISyncSubject {
  @IsString()
  @Type(() => String)
  'รหัสวิชา': string

  @IsString()
  'ชื่อวิชา': string

  @IsBoolean()
  @Transform(({ value }) => (value === 'x' ? true : false))
  'วิชาบังคับ': boolean

  @IsString()
  'หน่วยกิต': string

  @IsString()
  'หลักสูตร': string

  @IsBoolean()
  @Transform(({ value }) => (value === 'x' ? true : false))
  'นานาชาติ': boolean

  @IsBoolean()
  @Transform(({ value }) => (value === 'x' ? true : false))
  'ใช้ห้องเรียน': boolean
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
  @ValidateNested()
  @Type(() => ISyncTeacher)
  @IsArray()
  data: ISyncTeacher[]
}

export class ISyncSubjectBody {
  @ValidateNested()
  @Type(() => ISyncSubject)
  @IsArray()
  data: ISyncSubject[]
}

export class ISyncRoomBody {
  @ValidateNested()
  @Type(() => ISyncRoom)
  @IsArray()
  data: ISyncRoom[]
}

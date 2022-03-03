import { Body, JsonController, Post } from 'routing-controllers'
import { get } from 'lodash'

import { ValidateBody } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { Teacher } from '@models/teacher'
import { Subject } from '@models/subject'
import { Room } from '@models/room'

import { ISyncTeacherBody, ISyncSubjectBody, ISyncRoomBody } from './types/sync'

@JsonController()
export class SyncController {
  @Post('/sync/teacher')
  @ValidateBody(ISyncTeacherBody)
  async syncTeacher(@Body() body: ISyncTeacherBody) {
    const titleRegex = new RegExp(/(.+)\./)

    const syncList = <Teacher[]>[]
    for (const [i, _teacher] of body.data.entries()) {
      const title = get(_teacher['ชื่อ-สกุล'].match(titleRegex), 0, '').trim()
      const name = _teacher['ชื่อ-สกุล']
        .replace(titleRegex, '')
        .split(/\s+/)
        .map((each) => each.trim())
        .join(' ')
      if (!title) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format ชื่อ-สกุล(${
            _teacher['ชื่อ-สกุล']
          })`,
        ])
      }

      const teacher =
        (await Teacher.findOne({ where: { name } })) || new Teacher()
      teacher.title = title
      teacher.name = name
      teacher.executiveRole = _teacher.ตำแหน่งบริหาร
      teacher.isActive = true
      teacher.isExternal = _teacher.อาจารย์ภายนอก

      syncList.push(teacher)
    }
    const result = await Teacher.save(syncList)

    return {
      syncCount: result.length,
      result: result.map((each) => each.getFullName()),
    }
  }

  @Post('/sync/subject')
  @ValidateBody(ISyncSubjectBody)
  async syncSubject(@Body() body: ISyncSubjectBody) {
    const codeRegex = new RegExp(/^\d{8}$/)
    const creditRegex = new RegExp(/^(\d+\(\d+\-\d+\-\d+\))$/)

    const syncList = <Subject[]>[]
    for (const [i, _subject] of body.data.entries()) {
      if (!codeRegex.test(_subject.รหัสวิชา)) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format รหัสวิชา(${_subject.รหัสวิชา})`,
        ])
      }
      const creditList = _subject.หน่วยกิต.match(/\d+/g) || []
      if (!creditRegex.test(_subject.หน่วยกิต) || creditList.length !== 4) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format หน่วยกิต(${_subject.หน่วยกิต})`,
        ])
      }
      if (!_subject.หลักสูตร.trim()) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format หลักสูตร(${_subject.หลักสูตร})`,
        ])
      }

      const subject =
        (await Subject.findOne({ where: { code: _subject.รหัสวิชา } })) ||
        new Subject()

      subject.code = _subject.รหัสวิชา
      subject.name = _subject.ชื่อวิชา
        .split(/\s+/)
        .map((each) => each.trim().toUpperCase())
        .join(' ')
      subject.isRequired = _subject.วิชาบังคับ
      subject.credit = parseInt(creditList[0])
      subject.lectureHours = parseInt(creditList[1])
      subject.labHours = parseInt(creditList[2])
      subject.independentHours = parseInt(creditList[3])
      subject.curriculumCode = _subject.หลักสูตร.trim().toUpperCase()
      subject.isInter = _subject.นานาชาติ
      subject.requiredRoom = _subject.ใช้ห้องเรียน

      syncList.push(subject)
    }
    const result = await Subject.save(syncList)

    return {
      syncCount: result.length,
      result: result.map((each) => `${each.code} - ${each.name}`),
    }
  }

  @Post('/sync/room')
  @ValidateBody(ISyncRoomBody)
  async syncRoom(@Body() body: ISyncRoomBody) {
    const syncList = <Room[]>[]
    for (const [i, _room] of body.data.entries()) {
      if (!_room.ชื่อห้อง.trim()) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format ชื่อห้อง(${_room.ชื่อห้อง})`,
        ])
      }
      if (_room.จำนวนที่นั่ง < 0) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format จำนวนที่นั่ง(${
            _room.จำนวนที่นั่ง
          })`,
        ])
      }

      const room =
        (await Room.findOne({ where: { name: _room.ชื่อห้อง } })) || new Room()
      room.name = _room.ชื่อห้อง.trim()
      room.capacity = _room.จำนวนที่นั่ง

      syncList.push(room)
    }
    const result = await Room.save(syncList)

    return {
      syncCount: result.length,
      result: result.map((each) => each.name),
    }
  }
}

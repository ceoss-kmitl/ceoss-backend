import { Body, JsonController, Post } from 'routing-controllers'
import { get } from 'lodash'

import { ValidateBody } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { Teacher } from '@models/teacher'
import { Subject } from '@models/subject'

import { ISyncTeacherBody, ISynSubjectBody } from './types/sync'

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
  @ValidateBody(ISynSubjectBody)
  async syncSubject(@Body() body: ISynSubjectBody) {
    const codeRegex = new RegExp(/^(\d{8})$/)
    const creditRegex = new RegExp(/^(\d\(\d\-\d\-\d\))$/)

    const syncList = <Subject[]>[]
    for (const [i, _subject] of body.data.entries()) {
      if (!codeRegex.test(_subject.รหัสวิชา)) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format รหัสวิชา(${_subject.รหัสวิชา})`,
        ])
      }
      if (!creditRegex.test(_subject.หน่วยกิต)) {
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
      subject.credit = parseInt(_subject.หน่วยกิต[0])
      subject.lectureHours = parseInt(_subject.หน่วยกิต[2])
      subject.labHours = parseInt(_subject.หน่วยกิต[4])
      subject.independentHours = parseInt(_subject.หน่วยกิต[6])
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
}

import { Body, JsonController, Post } from 'routing-controllers'
import { get, uniq } from 'lodash'

import { ValidateBody } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { Teacher } from '@models/teacher'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Time } from '@models/time'
import { Workload } from '@models/workload'
import { Assistant } from '@models/assistant'
import { AssistantWorkload } from '@models/assistantWorkload'

import {
  ISyncTeacherBody,
  ISyncSubjectBody,
  ISyncRoomBody,
  ISyncAssistantBody,
} from './types/sync'

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
        .filter((each) => each.length)
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
      ;(<any>teacher).__fileIndex = i + 1

      const existingTeacher = syncList.find((t) => t.name === teacher.name)
      if (existingTeacher) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has dulplicated with Data #${
            (<any>existingTeacher).__fileIndex
          }`,
        ])
      }
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
        .filter((each) => each.length)
        .join(' ')
      subject.isRequired = _subject.วิชาบังคับ
      subject.credit = parseInt(creditList[0])
      subject.lectureHours = parseInt(creditList[1])
      subject.labHours = parseInt(creditList[2])
      subject.independentHours = parseInt(creditList[3])
      subject.curriculumCode = _subject.หลักสูตร.trim().toUpperCase()
      subject.isInter = _subject.นานาชาติ
      subject.requiredRoom = _subject.ใช้ห้องเรียน
      ;(<any>subject).__fileIndex = i + 1

      const existingSubject = syncList.find((s) => s.code === subject.code)
      if (existingSubject) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has dulplicated with Data #${
            (<any>existingSubject).__fileIndex
          }`,
        ])
      }
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
      ;(<any>room).__fileIndex = i + 1

      const existingRoom = syncList.find((r) => r.name === room.name)
      if (existingRoom) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has dulplicated with Data #${
            (<any>existingRoom).__fileIndex
          }`,
        ])
      }
      syncList.push(room)
    }
    const result = await Room.save(syncList)

    return {
      syncCount: result.length,
      result: result.map((each) => each.name),
    }
  }

  @Post('/sync/assistant')
  @ValidateBody(ISyncAssistantBody)
  async syncAssistant(@Body() body: ISyncAssistantBody) {
    const codeRegex = new RegExp(/^(\d{8})$/)

    const syncList = <{ ta: string; subject: string; date: string }[]>[]
    for (const [i, _ta] of body.data.entries()) {
      const subjectCode = _ta.รหัสวิชา
      const taCode = _ta.รหัสนักศึกษา
      const date = Time.toDayjsDate(_ta.วันปฏิบัติงาน)

      if (!date) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format วันปฏิบัติงาน(${
            _ta.วันปฏิบัติงาน
          })`,
        ])
      }
      if (!codeRegex.test(subjectCode)) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format รหัสวิชา(${subjectCode})`,
        ])
      }
      if (!codeRegex.test(taCode)) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format รหัสนักศึกษา(${taCode})`,
        ])
      }
      const subject = await Subject.findOne({ where: { code: subjectCode } })
      if (!subject) {
        throw new BadRequestError('ไม่พบรหัสวิชาดังกล่าว', [
          `Data #${i + 1} has invalid format รหัสวิชา(${subjectCode})`,
        ])
      }

      const { academicYear, semester } = Time.toAcademicYear(date)

      // Find Workload list of this section
      const workloadList = await Workload.find({
        relations: [
          'subject',
          'assistantWorkloadList',
          'assistantWorkloadList.workload',
          'assistantWorkloadList.assistant',
        ],
      })
      const filteredWorkloadList = workloadList.filter(
        (w) =>
          w.academicYear === academicYear &&
          w.semester === semester &&
          w.subject.code === _ta.รหัสวิชา &&
          w.section === _ta.กลุ่มเรียน
      )
      let isPushIntoSyncList = false
      for (const _workload of filteredWorkloadList) {
        // Find existing TA or create new one
        const assistant =
          (await Assistant.findOne({
            relations: [
              'assistantWorkloadList',
              'assistantWorkloadList.assistant',
              'assistantWorkloadList.workload',
              'assistantWorkloadList.workload.subject',
            ],
            where: { id: _ta.รหัสนักศึกษา },
          })) || Assistant.create({ assistantWorkloadList: [] })
        assistant.id = _ta.รหัสนักศึกษา
        assistant.name = _ta['ชื่อ-สกุล']

        // Find existing AssistantWorkload or create new one
        const aw =
          assistant.assistantWorkloadList.find(
            (aw) => aw.workload.id === _workload.id
          ) || AssistantWorkload.create({ dayList: [] })

        // Update AssistantWorkload
        aw.assistant = assistant
        aw.workload = _workload

        const uniqDayList = uniq(
          [...aw.dayList, date.toDate()].map((each) => each.getTime())
        ).map((each) => new Date(each))
        aw.dayList = uniqDayList
        await aw.save()

        if (!isPushIntoSyncList) {
          syncList.push({
            ta: `${assistant.id} ${assistant.name}`,
            subject: `${_workload.subject.code} ${_workload.subject.name} กลุ่ม ${_workload.section}`,
            date: `${_ta.วันปฏิบัติงาน}`,
          })
          isPushIntoSyncList = true
        }
      }
    }

    return {
      syncCount: syncList.length,
      result: syncList,
    }
  }
}

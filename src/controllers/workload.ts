import { In, IsNull, Not } from 'typeorm'
import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers'
import { isNil, merge, omit, omitBy } from 'lodash'
import dayjs from 'dayjs'

import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
import { Time } from '@models/time'
import { TeacherWorkload } from '@models/teacherWorkload'

import {
  ICreateCompensationWorkloadBody,
  ICreateWorkload,
  IEditAssistantOfWorkload,
  IEditWorkload,
  IGetWorkloadQuery,
} from './types/workload'
import { Assistant } from '@models/assistant'
import { AssistantWorkload } from '@models/assistantWorkload'

@JsonController()
export class WorkloadController {
  // =======================
  // Workload x Compensation
  // =======================

  @Post('/workload/:id/compensation')
  @ValidateBody(ICreateCompensationWorkloadBody)
  @Authorized()
  async createCompensationWorkload(
    @Param('id') id: string,
    @Body() body: ICreateCompensationWorkloadBody
  ) {
    const { roomId, originalDate, compensatedDate, compensatedTimeList } = body

    const workload = await Workload.findOne({
      relations: [
        'compensationFrom',
        'timeList',
        'room',
        'subject',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
      ],
      where: { id },
    })
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานที่จะชดเชย', [
        `Workload id id(${id}) is not found`,
      ])

    const room = await Room.findOne({
      where: { id: roomId },
    })
    if (!room && roomId)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${roomId}) is not found`,
      ])

    const compensationWorkload = Workload.create({
      ...omit(workload, 'id'),
      dayOfWeek: dayjs(compensatedDate).weekday(),
      room,
      compensationFrom: workload,
      compensationFromDate: originalDate,
      compensationDate: compensatedDate,
      timeList: compensatedTimeList.map(([startTime, endTime]) =>
        Time.createFromTimeString(startTime, endTime)
      ),
    })
    compensationWorkload.teacherWorkloadList = workload.teacherWorkloadList.map(
      (tw) => {
        return TeacherWorkload.create({ ...tw, workload: compensationWorkload })
      }
    )

    await TeacherWorkload.save(compensationWorkload.teacherWorkloadList)
    return 'Compensation-Workload created'
  }

  // ====================
  // Workload x Assistant
  // ====================
  @Put('/workload/assistant')
  @ValidateBody(IEditAssistantOfWorkload)
  @Authorized()
  async editAssistantListOfWorkload(@Body() body: IEditAssistantOfWorkload) {
    const workloadList = await Workload.find({
      relations: [
        'assistantWorkloadList',
        'assistantWorkloadList.assistant',
        'assistantWorkloadList.workload',
      ],
      where: {
        id: In(body.workloadIdList),
      },
    })
    if (workloadList.length !== body.workloadIdList.length)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload id(${body.workloadIdList.join(', ')}) is not found`,
      ])

    for (const _workload of workloadList) {
      const assistantList = _workload.getAssistantList()
      const awList: AssistantWorkload[] = []

      // Remove old AW
      await AssistantWorkload.remove(_workload.assistantWorkloadList)

      for (const _assistant of body.assistantList) {
        // Find existing TA or Create, then update it
        const assistant =
          assistantList.find((each) => each.id === _assistant.assistantId) ||
          Assistant.create()

        assistant.id = _assistant.assistantId
        assistant.name = _assistant.assistantName.trim()

        const aw = new AssistantWorkload()
        aw.assistant = assistant
        aw.workload = _workload
        aw.dayList = body.dayList.map((day) => new Date(day))
        awList.push(aw)
      }
      // Add new AW
      await AssistantWorkload.save(awList)
    }

    return 'Assistant workload updated'
  }

  // =============
  // CRUD Endpoint
  // =============

  @Get('/workload')
  @ValidateQuery(IGetWorkloadQuery)
  @Authorized()
  async getWorkload(@QueryParams() query: IGetWorkloadQuery) {
    const queryPayload = omitBy(
      {
        ...omit(query, ['compensation', 'requiredRoom']),
        room: query.room === 'NULL' ? IsNull() : query.room,
        compensationFrom: { true: Not(IsNull()), false: IsNull() }[
          String(query.compensation)
        ],
      },
      isNil
    )
    const workloadList = await Workload.find({
      relations: [
        'compensationFrom',
        'room',
        'subject',
        'timeList',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
      ],
      where: { ...queryPayload },
    })

    const filteredWorkloadList = workloadList.filter((workload) =>
      query.requiredRoom === undefined
        ? true
        : workload.subject.requiredRoom === query.requiredRoom
    )

    return filteredWorkloadList.map((workload) => ({
      workloadId: workload.id,
      roomId: workload.room?.id,
      subjectCode: workload.subject.code,
      subjectName: workload.subject.name,
      section: workload.section,
      dayOfWeek: workload.dayOfWeek,
      startTime: Time.toTimeString(workload.getFirstTimeSlot()),
      endTime: Time.toTimeString(workload.getLastTimeSlot() + 1),
      teacherList: workload
        .getTeacherList()
        .map((teacher) => teacher.getFullName()),
    }))
  }

  @Post('/workload')
  @ValidateBody(ICreateWorkload)
  @Authorized()
  async createWorkload(@Body() body: ICreateWorkload) {
    const subject = await Subject.findOne({
      where: { id: body.subjectId },
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${body.subjectId}) is not found`,
      ])

    const room = await Room.findOne({
      where: { id: body.roomId },
    })
    if (!room && body.roomId)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room id(${body.roomId}) is not found`,
      ])

    const timeList = body.timeList.map(([startTime, endTime]) =>
      Time.create({
        startSlot: Time.fromTimeString(startTime),
        endSlot: Time.fromTimeString(endTime) - 1,
      })
    )

    const workloadPayload = {
      ...body,
      subject,
      room,
      timeList,
    }
    const workload = new Workload()
    merge(workload, workloadPayload)

    const twList: TeacherWorkload[] = []
    for (const _teacher of body.teacherList) {
      const teacher = await Teacher.findOne({
        where: { id: _teacher.teacherId },
        relations: ['teacherWorkloadList'],
      })
      if (!teacher)
        throw new NotFoundError('ไม่พบรายชื่อผู้สอน', [
          `Teacher id(${_teacher.teacherId}) is not found`,
        ])

      const twPayload = {
        ..._teacher,
        workload,
        teacher,
      }
      const tw = new TeacherWorkload()
      merge(tw, twPayload)
      twList.push(tw)
    }

    await TeacherWorkload.save(twList)
    return 'Workload created'
  }

  @Put('/workload/:id')
  @ValidateBody(IEditWorkload)
  @Authorized()
  async editWorkload(@Param('id') id: string, @Body() body: IEditWorkload) {
    const workload = await Workload.findOne({
      where: { id },
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.teacher',
      ],
    })
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload id(${id}) is not found`,
      ])

    const twList: TeacherWorkload[] = []
    for (const _teacher of body.teacherList) {
      const tw = workload.getTeacherWorkload(_teacher.teacherId)
      if (!tw)
        throw new NotFoundError('ไม่พบภาระงานของผู้สอน', [
          `TeacherWorkload of teacher id(${_teacher.teacherId}) is not found`,
        ])

      merge(tw, _teacher)
      twList.push(tw)
    }

    await TeacherWorkload.save(twList)
    return 'Workload edited'
  }

  @Delete('/workload/:id')
  @Authorized()
  async deleteWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne({
      where: { id },
    })
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload id(${id}) is not found`,
      ])

    await workload.remove()
    return 'Workload deleted'
  }
}

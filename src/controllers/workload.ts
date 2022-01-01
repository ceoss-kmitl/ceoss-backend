import { Response } from 'express'
import { IsNull } from 'typeorm'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
  Res,
  UseBefore,
} from 'routing-controllers'
import { isNil, merge, omitBy } from 'lodash'

import { Excel } from '@libs/Excel'
import { cloneClass } from '@libs/utils'
import { schema } from '@middlewares/schema'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
import { Time } from '@models/time'
import { TeacherWorkload } from '@models/teacherWorkload'

import {
  IBodyExcelExternal,
  ICreateWorkload,
  IEditWorkload,
  IGetWorkloadExcel5Query,
  IGetWorkloadExcelQuery,
  IGetWorkloadQuery,
} from './types/workload'
import { generateWorkloadExcel1 } from './templates/workloadExcel1'
import { generateWorkloadExcel2 } from './templates/workloadExcel2'
import { generateWorkloadExcel3 } from './templates/workloadExcel3'
import { generateWorkloadExcel5 } from './templates/workloadExcel5'
import { generateWorkloadExcel3External } from './templates/workloadExcel3External'

@JsonController()
export class WorkloadController {
  @Get('/workload/excel')
  @UseBefore(schema(IGetWorkloadExcelQuery, 'query'))
  async getWorkloadExcel(
    @Res() res: Response,
    @QueryParams() query: IGetWorkloadExcelQuery
  ) {
    const { teacher_id, academic_year, semester } = query

    const teacher = await Teacher.findOne({
      where: { id: teacher_id },
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload.subject',
        'teacherWorkloadList.workload.timeList',
        'teacherWorkloadList.workload.teacherWorkloadList',
        'teacherWorkloadList.workload.teacherWorkloadList.teacher',
      ],
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${teacher_id} is not found`,
      ])

    const excel = new Excel(res)
    await generateWorkloadExcel1(
      excel,
      cloneClass(teacher),
      academic_year,
      semester
    )
    await generateWorkloadExcel2(
      excel,
      cloneClass(teacher),
      academic_year,
      semester
    )
    await generateWorkloadExcel3(
      excel,
      cloneClass(teacher),
      academic_year,
      semester
    )

    const yearAndSemester = `${String(academic_year).substr(2, 2)}-${semester}`
    const file = await excel.createFile(`${yearAndSemester} ${teacher.name}`)
    return file
  }

  // Use POST instead of GET because body part is required
  @Post('/workload/excel-external')
  @UseBefore(schema(IGetWorkloadExcelQuery, 'query'))
  async getWorkloadExcelExternal(
    @Res() res: Response,
    @QueryParams() query: IGetWorkloadExcelQuery,
    @Body() body: IBodyExcelExternal
  ) {
    const { teacher_id, academic_year, semester } = query

    const teacher = await Teacher.findOne(teacher_id, {
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.workload.timeList',
        'teacherWorkloadList.workload.subject',
      ],
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${teacher_id} is not found`,
      ])

    const excel = new Excel(res)
    await generateWorkloadExcel3External(
      excel,
      cloneClass(teacher),
      academic_year,
      semester,
      body
    )

    const monthAndYear = `${body.month} ${String(academic_year).substr(2, 2)}`
    const file = await excel.createFile(`${monthAndYear} ${teacher.name}`)
    return file
  }

  @Get('/workload/excel-5')
  @UseBefore(schema(IGetWorkloadExcel5Query, 'query'))
  async getWorkloadExcel5(
    @Res() res: Response,
    @QueryParams() query: IGetWorkloadExcel5Query
  ) {
    const { academic_year, semester } = query

    const teacherList = await Teacher.createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.teacherWorkloadList', 'teacherWorkloadList')
      .innerJoinAndSelect(
        'teacherWorkloadList.workload',
        'workload',
        'workload.academicYear = :academic_year AND workload.semester = :semester',
        { academic_year, semester }
      )
      .innerJoinAndSelect('teacherWorkloadList.teacher', 't')
      .innerJoinAndSelect('workload.timeList', 'timeList')
      .where('teacher.isActive = :isActive', { isActive: true })
      .andWhere('teacherWorkloadList.isClaim = :isClaim', { isClaim: true })
      .andWhere('teacher.isExternal = :isExternal', { isExternal: false })
      .getMany()

    const excel = new Excel(res)
    await generateWorkloadExcel5(excel, teacherList, academic_year, semester)

    const yearAndSemester = `${String(academic_year).substr(2, 2)}-${semester}`
    const file = await excel.createFile(`${yearAndSemester} หลักฐานการเบิกจ่าย`)
    return file
  }

  // =============
  // CRUD Endpoint
  // =============

  @Get('/workload')
  @ValidateQuery(IGetWorkloadQuery)
  async getWorkload(@QueryParams() query: IGetWorkloadQuery) {
    const queryPayload = omitBy(
      {
        ...query,
        room: query.room === 'NULL' ? IsNull() : query.room,
      },
      isNil
    )
    const workloadList = await Workload.find({
      relations: [
        'room',
        'subject',
        'timeList',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
      ],
      where: { ...queryPayload },
    })

    return workloadList.map((workload) => ({
      workloadId: workload.id,
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

  // NOTE: Now can edit only `teacherWorkloadList`
  @Put('/workload/:id')
  @ValidateBody(IEditWorkload)
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

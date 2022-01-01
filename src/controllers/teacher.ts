import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers'
import { Not } from 'typeorm'
import { isNil, merge, omitBy } from 'lodash'

import { DayOfWeek } from '@constants/common'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'
import { Teacher } from '@models/teacher'

import {
  ICreateTeacher,
  IEditTeacher,
  IGetTeacherQuery,
  IGetTeacherWorkloadResponse,
} from './types/teacher'
import { IGetTeacherWorkloadQuery } from './types/workload'

@JsonController()
export class TeacherController {
  // ==================
  // Teacher x Workload
  // ==================

  @Get('/teacher/:id/workload')
  @ValidateQuery(IGetTeacherWorkloadQuery)
  async getTeacherWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetTeacherWorkloadQuery
  ) {
    const { academicYear, semester } = query

    const teacher = await Teacher.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    const result: IGetTeacherWorkloadResponse[] = []
    for (let day = DayOfWeek.MONDAY; day <= DayOfWeek.SUNDAY; day++) {
      result.push({
        workloadList: [],
      })
    }

    for (const _workload of teacher.getWorkloadList()) {
      const thisDay = result[_workload.dayOfWeek - 1]
      const { subject, room } = _workload
      const teacherListOfThisWorkload = _workload.teacherWorkloadList.map(
        (tw) => ({
          teacherId: tw.teacher.id,
          weekCount: tw.weekCount,
          isClaim: tw.isClaim,
        })
      )
      const isThisTeacherClaimThisWorkload = _workload.teacherWorkloadList.some(
        (tw) => tw.teacher.id === id && tw.isClaim
      )

      thisDay.workloadList.push({
        id: _workload.id,
        roomId: room?.id,
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        section: _workload.section,
        type: _workload.type,
        fieldOfStudy: _workload.fieldOfStudy,
        degree: _workload.degree,
        classYear: _workload.classYear,
        dayOfWeek: _workload.dayOfWeek,
        startSlot: _workload.getFirstTimeSlot(),
        endSlot: _workload.getLastTimeSlot(),
        timeList: _workload.getTimeStringList(),
        teacherList: teacherListOfThisWorkload,
        isClaim: isThisTeacherClaimThisWorkload,
      })
    }

    return result
  }

  // =============
  // CRUD Endpoint
  // =============

  @Get('/teacher')
  @ValidateQuery(IGetTeacherQuery)
  async getTeacher(@QueryParams() query: IGetTeacherQuery) {
    const teacherList = await Teacher.find({
      where: { ...query },
      order: { name: 'ASC' },
    })
    return teacherList
  }

  @Post('/teacher')
  @ValidateBody(ICreateTeacher)
  async createTeacher(@Body() body: ICreateTeacher) {
    const isExist = await Teacher.findOne({
      where: { name: body },
    })
    if (isExist)
      throw new BadRequestError('มีอาจารย์ชื่อนี้ในระบบอยู่แล้ว', [
        `Teacher name(${body.name}) already exists`,
      ])

    const teacher = new Teacher()
    merge(teacher, body)

    await teacher.save()
    return 'Created'
  }

  @Put('/teacher/:id')
  @ValidateBody(IEditTeacher)
  async edit(@Param('id') id: string, @Body() body: IEditTeacher) {
    const teacher = await Teacher.findOne({
      where: { id },
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    const isExist = await Teacher.findOne({
      where: {
        id: Not(id),
        name: body.name,
      },
    })
    if (isExist)
      throw new BadRequestError('มีอาจารย์ชื่อนี้ในระบบอยู่แล้ว', [
        `Teacher name(${body.name}) already exists`,
      ])

    const payload = omitBy(body, isNil)
    merge(teacher, payload)

    await teacher.save()
    return 'Edited'
  }

  @Delete('/teacher/:id')
  async delete(@Param('id') id: string) {
    const teacher = await Teacher.findOne({
      where: { id },
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    await teacher.remove()
    return 'Deleted'
  }
}

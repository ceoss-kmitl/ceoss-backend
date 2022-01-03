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
} from 'routing-controllers'
import { Response } from 'express'
import { Not } from 'typeorm'
import { isNil, merge, omitBy, cloneDeep } from 'lodash'

import { DayOfWeek } from '@constants/common'
import { Excel } from '@libs/Excel'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'
import { Teacher } from '@models/teacher'

import {
  ICreateTeacher,
  IEditTeacher,
  IGetTeacherQuery,
  IGetTeacherWorkloadResponse,
  IGetTeacherWorkloadQuery,
  IDownloadTeacherWorkloadExcelQuery,
  IDownloadExtTeacherWorkloadExcelQuery,
  IDownloadTeacherWorkloadExcel5Query,
} from './types/teacher'
import { generateWorkloadExcel1 } from './templates/workloadExcel1'
import { generateWorkloadExcel2 } from './templates/workloadExcel2'
import { generateWorkloadExcel3 } from './templates/workloadExcel3'
import { generateWorkloadExcel3External } from './templates/workloadExcel3External'
import { generateWorkloadExcel5 } from './templates/workloadExcel5'

@JsonController()
export class TeacherController {
  // =============
  // Teacher Excel
  // =============

  @Get('/teacher/:id/workload/excel')
  @ValidateQuery(IDownloadTeacherWorkloadExcelQuery)
  async getWorkloadExcel(
    @Res() res: Response,
    @Param('id') id: string,
    @QueryParams() query: IDownloadTeacherWorkloadExcelQuery
  ) {
    const { academicYear, semester } = query

    const teacher = await Teacher.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
      compensation: false,
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    const excel = new Excel(res)
    await generateWorkloadExcel1(
      excel,
      cloneDeep(teacher),
      academicYear,
      semester
    )
    await generateWorkloadExcel2(
      excel,
      cloneDeep(teacher),
      academicYear,
      semester
    )
    await generateWorkloadExcel3(
      excel,
      cloneDeep(teacher),
      academicYear,
      semester
    )

    const yearSemester = `${String(academicYear).substring(2, 4)}-${semester}`
    const file = await excel.createFile(`${yearSemester} ${teacher.name}`)
    return file
  }

  @Get('/teacher-external/:id/workload/excel')
  @ValidateQuery(IDownloadExtTeacherWorkloadExcelQuery)
  async getWorkloadExcelExternal(
    @Res() res: Response,
    @Param('id') id: string,
    @QueryParams() query: IDownloadExtTeacherWorkloadExcelQuery
  ) {
    const { month, academicYear, semester } = query

    const teacher = await Teacher.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
      compensation: false,
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher (${id}) is not found`,
      ])

    const excel = new Excel(res)
    await generateWorkloadExcel3External(excel, cloneDeep(teacher), query)

    const monthAndYear = `${month} ${String(academicYear).substring(2, 4)}`
    const file = await excel.createFile(`${monthAndYear} ${teacher.name}`)
    return file
  }

  @Get('/teacher/workload/excel-5')
  @ValidateQuery(IDownloadTeacherWorkloadExcel5Query)
  async getWorkloadExcel5(
    @Res() res: Response,
    @QueryParams() query: IDownloadTeacherWorkloadExcel5Query
  ) {
    const { academicYear, semester } = query

    const teacherList = await Teacher.findManyAndJoinWorkload({
      isActive: true,
      isExternal: false,
      compensation: false,
      academicYear,
      semester,
    })

    const excel = new Excel(res)
    await generateWorkloadExcel5(excel, teacherList, academicYear, semester)

    const yearSemester = `${String(academicYear).substring(2, 4)}-${semester}`
    const file = await excel.createFile(`${yearSemester} หลักฐานการเบิกจ่าย`)
    return file
  }

  // ==================
  // Teacher x Workload
  // ==================

  @Get('/teacher/:id/workload')
  @ValidateQuery(IGetTeacherWorkloadQuery)
  async getTeacherWorkload(
    @Param('id') id: string,
    @QueryParams() query: IGetTeacherWorkloadQuery
  ) {
    const { academicYear, semester, compensation } = query

    const teacher = await Teacher.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
      compensation,
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
      const thisDay = result[_workload.dayOfWeek]
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

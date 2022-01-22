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
import { chain, isNil, merge, omitBy } from 'lodash'
import { Not } from 'typeorm'

import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { NotFoundError } from '@errors/notFoundError'
import { Subject } from '@models/subject'

import {
  ICreateSubject,
  IEditSubject,
  IGetSubjectSectionInfoQuery,
  IGetSubjectCompensationWorkloadQuery,
} from './types/subject'

@JsonController()
export class SubjectController {
  // ==================
  // Subject x Workload
  // ==================

  @Get('/subject/:id/compensation-workload')
  @ValidateQuery(IGetSubjectCompensationWorkloadQuery)
  async getSubjectCompensatedHistory(
    @Param('id') id: string,
    @QueryParams() query: IGetSubjectCompensationWorkloadQuery
  ) {
    const { academicYear, semester } = query

    const subject = await Subject.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${id}) is not found`,
      ])

    const compensationWorkloadGroupBySection = chain(subject.workloadList)
      .groupBy((workload) => workload.section)
      .mapValues((workloadList) =>
        workloadList.filter((w) => w.compensationDate)
      )
      .value()
    const result = Object.entries(compensationWorkloadGroupBySection).map(
      ([section, workloadList]) => ({
        section: Number(section),
        compensatedList: workloadList.map((w) => ({
          compensatedId: w.id,
          originalDate: w.compensationFromDate,
          originalTimeList: w.compensationFrom.getTimeStringList(),
          compensatedDate: w.compensationDate,
          compensatedTimeList: w.getTimeStringList(),
          originalRoom: w.compensationFrom.room?.name,
          compensatedRoom: w.room?.name,
        })),
      })
    )

    return result
  }

  // ====================
  // Subject x Section
  // ====================
  @Get('/subject/:id/section')
  @ValidateQuery(IGetSubjectSectionInfoQuery)
  async getAssistantListOfSubject(
    @Param('id') id: string,
    @QueryParams() query: IGetSubjectSectionInfoQuery
  ) {
    const { academicYear, semester } = query
    const subject = await Subject.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${id}) is not found`,
      ])

    const workloadGroupBySection = chain(subject.workloadList)
      .groupBy((workload) => workload.section)
      .mapValues((workloadList) =>
        workloadList.filter((w) => !w.compensationDate)
      )
      .value()
    const result = Object.entries(workloadGroupBySection).map(
      ([section, workloadList]) => ({
        section: Number(section),
        workloadIdList: workloadList.map((w) => w.id),
        assistantList: chain(workloadList)
          .map((w) => w.assistantWorkloadList)
          .flatten()
          .map((aw) => ({
            id: aw.assistant.id,
            name: aw.assistant.name,
            dayList: aw.dayList,
          }))
          .uniqBy((assistant) => assistant.id)
          .value(),
        teacherList: chain(workloadList)
          .map((w) => w.teacherWorkloadList)
          .flatten()
          .map((tw) => ({
            id: tw.teacher.id,
            name: tw.teacher.name,
          }))
          .uniqBy((teacher) => teacher.id)
          .value(),
      })
    )

    return result
  }

  // =============
  // CRUD Endpoint
  // =============

  @Get('/subject')
  async getSubject() {
    const subjectList = await Subject.find({
      order: { name: 'ASC' },
    })
    return subjectList
  }

  @Post('/subject')
  @ValidateBody(ICreateSubject)
  async create(@Body() body: ICreateSubject) {
    const isExist = await Subject.findOne({
      where: { code: body.code },
    })
    if (isExist)
      throw new BadRequestError('มีรหัสวิชานี้อยู่แล้วในระบบ', [
        `Subject code (${body.code}) already exists`,
      ])

    const subject = new Subject()
    merge(subject, body)

    await subject.save()
    return 'Created'
  }

  @Put('/subject/:id')
  @ValidateBody(IEditSubject)
  async edit(@Param('id') id: string, @Body() body: IEditSubject) {
    const subject = await Subject.findOne({
      where: { id },
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${id}) is not found`,
      ])

    const isExist = await Subject.findOne({
      where: {
        id: Not(id),
        code: body.code,
      },
    })
    if (isExist)
      throw new BadRequestError('มีรหัสวิชานี้อยู่แล้วในระบบ', [
        `Subject code(${body.code}) already exists`,
      ])

    const payload = omitBy(body, isNil)
    merge(subject, payload)

    await subject.save()
    return 'Edited'
  }

  @Delete('/subject/:id')
  async delete(@Param('id') id: string) {
    const subject = await Subject.findOne({
      where: { id },
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${id}) is not found`,
      ])

    await subject.remove()
    return 'Deleted'
  }
}

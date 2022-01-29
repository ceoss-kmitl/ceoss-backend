import dayjs from 'dayjs'
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
  Res,
} from 'routing-controllers'
import { chain, cloneDeep, isNil, merge, omitBy } from 'lodash'
import { Not } from 'typeorm'
import { Response } from 'express'

import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { NotFoundError } from '@errors/notFoundError'
import { Subject } from '@models/subject'
import { Excel } from '@libs/Excel'

import {
  ICreateSubject,
  IEditSubject,
  IGetSubjectSectionInfoQuery,
  IGetSubjectCompensationWorkloadQuery,
  IDownloadAssistantExcelQuery,
} from './types/subject'
import { generateAssistantExcel1 } from './templates/assistantExcel1'

@JsonController()
export class SubjectController {
  // =============
  // Subject Excel
  // =============

  @Get('/subject/:id/section/:section/assistant/excel')
  @ValidateQuery(IDownloadAssistantExcelQuery)
  @Authorized()
  async downloadAssistantSubject(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('section') section: number,
    @QueryParams() query: IDownloadAssistantExcelQuery
  ) {
    const { academicYear, semester, documentDate } = query

    const subject = await Subject.findOneByIdAndJoinWorkload(id, {
      academicYear,
      semester,
      section,
    })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject id(${id}) is not found`,
      ])

    const excel = new Excel(res)
    await generateAssistantExcel1(excel, cloneDeep(subject), query)

    const monthYear = dayjs(documentDate).format('MM BB')
    const subjectCodeNameSection = `${subject.code} ${subject.name} (กลุ่ม ${section})`
    const file = await excel.createFile(
      `TA วิชา ${subjectCodeNameSection} - ${monthYear}`
    )
    return file
  }

  // ==================
  // Subject x Workload
  // ==================
  @Get('/subject/:id/compensation-workload')
  @ValidateQuery(IGetSubjectCompensationWorkloadQuery)
  @Authorized()
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

  // =================
  // Subject x Section
  // =================

  @Get('/subject/:id/section')
  @ValidateQuery(IGetSubjectSectionInfoQuery)
  @Authorized()
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
        dayList: chain(workloadList)
          .map((w) => w.assistantWorkloadList)
          .flatten()
          .head()
          .get('dayList', [])
          .value(),
        assistantList: chain(workloadList)
          .map((w) => w.assistantWorkloadList)
          .flatten()
          .map((aw) => ({
            id: aw.assistant.id,
            name: aw.assistant.name,
          }))
          .uniqBy((assistant) => assistant.id)
          .value(),
        teacherList: chain(workloadList)
          .map((w) => w.teacherWorkloadList)
          .flatten()
          .map((tw) => ({
            id: tw.teacher.id,
            name: `${tw.teacher.title}${tw.teacher.name}`,
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
  @Authorized()
  async getSubject() {
    const subjectList = await Subject.find({
      order: { name: 'ASC' },
    })
    return subjectList
  }

  @Post('/subject')
  @ValidateBody(ICreateSubject)
  @Authorized()
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
  @Authorized()
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
  @Authorized()
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

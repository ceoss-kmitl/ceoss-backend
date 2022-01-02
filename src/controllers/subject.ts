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

import { mapTimeSlotToTime, mapTimeToTimeSlot } from '@libs/mapper'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { NotFoundError } from '@errors/notFoundError'
import { Subject } from '@models/subject'
import { Workload } from '@models/workload'
import { Room } from '@models/room'
import { Time } from '@models/time'

import {
  ICreateSubject,
  ICreateSubjectCompensationWorkloadBody,
  IEditSubject,
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

  //   @Delete('/subject/compensated/:compensatedId')
  //   async deleteSubjectCompensated(
  //     @Param('compensatedId') compensatedId: string
  //   ) {
  //     const compensated = await Compensated.findOne({
  //       where: { id: compensatedId },
  //     })
  //     if (!compensated)
  //       throw new NotFoundError('ไม่พบการชดเชยดังกล่าว', [
  //         `Compensated ${compensatedId} is not found`,
  //       ])

  //     await compensated.remove()
  //     return 'Removed'
  //   }

  //   @Post('/subject/:subjectId/compensated')
  //   @ValidateQuery(IPostSubjectCompensatedBody)
  //   async createSubjectCompensated(
  //     @Param('subjectId') subjectId: string,
  //     @Body() body: IPostSubjectCompensatedBody
  //   ) {
  //     const {
  //       academicYear,
  //       semester,
  //       section,
  //       roomId,
  //       originalDate,
  //       originalTimeList,
  //       compensatedDate,
  //       compensatedTimeList,
  //     } = body

  //     const workload = await Workload.createQueryBuilder('workload')
  //       .innerJoinAndSelect(
  //         'workload.subject',
  //         'subject',
  //         'subject.id = :subjectId',
  //         { subjectId }
  //       )
  //       .where('workload.academicYear = :academicYear', { academicYear })
  //       .andWhere('workload.semester = :semester', { semester })
  //       .andWhere('workload.section = :section', { section })
  //       .getOne()
  //     if (!workload)
  //       throw new NotFoundError('ไม่พบภาระงานที่จะชดเชย', [
  //         `Workload with subject id ${subjectId} is not found`,
  //       ])

  //     const room = await Room.findOne({ where: { id: roomId } })
  //     if (roomId && !room)
  //       throw new NotFoundError('ไม่พบห้องดังกล่าว', [
  //         `Room ${roomId} is not found`,
  //       ])

  //     // FIXME: Now this function is fully trust the payload
  //     // and just create compensated no matter what it compatible or not
  //     const compensated = new Compensated()
  //     compensated.originalDate = new Date(originalDate)
  //     compensated.compensatedDate = new Date(compensatedDate)
  //     compensated.compensatedRoom = room as Room
  //     compensated.workload = workload
  //     compensated.originalTimeList = originalTimeList.map(
  //       ([startTime, endTime]) =>
  //         Time.create({
  //           startSlot: mapTimeToTimeSlot(startTime),
  //           endSlot: mapTimeToTimeSlot(endTime) - 1,
  //         })
  //     )
  //     compensated.compensatedTimeList = compensatedTimeList.map(
  //       ([startTime, endTime]) =>
  //         Time.create({
  //           startSlot: mapTimeToTimeSlot(startTime),
  //           endSlot: mapTimeToTimeSlot(endTime) - 1,
  //         })
  //     )
  //     await compensated.save()

  //     return 'OK'
  //   }

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

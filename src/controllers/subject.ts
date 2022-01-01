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
import { isNil, merge, omitBy } from 'lodash'
import { Not } from 'typeorm'

import {
  ICreateSubject,
  IEditSubject,
  IGetSubjectCompensatedQuery,
  IPostSubjectCompensatedBody,
} from '@controllers/types/subject'
import { mapTimeSlotToTime, mapTimeToTimeSlot } from '@libs/mapper'
import { Subject } from '@models/subject'
import { Workload } from '@models/workload'
import { Room } from '@models/room'
import { Time } from '@models/time'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { BadRequestError } from '@errors/badRequestError'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class SubjectController {
  //   @Get('/subject/:subjectId/compensated')
  //   @ValidateQuery(IGetSubjectCompensatedQuery)
  //   async getSubjectCompensatedHistory(
  //     @Param('subjectId') subjectId: string,
  //     @QueryParams() query: IGetSubjectCompensatedQuery
  //   ) {
  //     const { academic_year, semester } = query

  //     const subject = await Subject.createQueryBuilder('subject')
  //       .leftJoinAndSelect(
  //         'subject.workloadList',
  //         'workloadList',
  //         'workloadList.academicYear = :academic_year AND workloadList.semester = :semester',
  //         { academic_year, semester }
  //       )
  //       .leftJoinAndSelect('workloadList.compensatedList', 'compensatedList')
  //       .leftJoinAndSelect('compensatedList.compensatedRoom', 'compensatedRoom')
  //       .leftJoinAndSelect('compensatedList.originalTimeList', 'originalTimeList')
  //       .leftJoinAndSelect(
  //         'compensatedList.compensatedTimeList',
  //         'compensatedTimeList'
  //       )
  //       .where('subject.id = :subjectId', { subjectId })
  //       .orderBy('workloadList.section', 'ASC')
  //       .getOne()
  //     if (!subject)
  //       throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
  //         `Subject ${subjectId} is not found`,
  //       ])

  //     const workloadGroupBySection: {
  //       section: number
  //       compensatedList: Compensated[]
  //     }[] = []
  //     for (const workload of subject.workloadList) {
  //       const listIndex = workloadGroupBySection.findIndex(
  //         (w) => w.section === workload.section
  //       )
  //       // New section
  //       if (listIndex === -1) {
  //         workloadGroupBySection.push({
  //           section: workload.section,
  //           compensatedList: [...workload.compensatedList],
  //         })
  //       } else {
  //         workloadGroupBySection[listIndex].compensatedList.push(
  //           ...workload.compensatedList
  //         )
  //       }
  //     }

  //     return workloadGroupBySection.map((w) => ({
  //       section: w.section,
  //       compensatedList: w.compensatedList.map((c) => ({
  //         compensatedId: c.id,
  //         originalDate: new Date(c.originalDate).toLocaleDateString('th-TH', {
  //           weekday: 'long',
  //           day: 'numeric',
  //           month: 'long',
  //           year: 'numeric',
  //         }),
  //         originalTimeList: c.originalTimeList.map((t) => ({
  //           start: mapTimeSlotToTime(t.startSlot),
  //           end: mapTimeSlotToTime(t.endSlot + 1),
  //         })),
  //         compensatedDate: new Date(c.compensatedDate).toLocaleDateString(
  //           'th-TH',
  //           {
  //             weekday: 'long',
  //             day: 'numeric',
  //             month: 'long',
  //             year: 'numeric',
  //           }
  //         ),
  //         compensatedTimeList: c.compensatedTimeList.map((t) => ({
  //           start: mapTimeSlotToTime(t.startSlot),
  //           end: mapTimeSlotToTime(t.endSlot + 1),
  //         })),
  //         room: c.compensatedRoom?.name || 'ไม่มี',
  //       })),
  //     }))
  //   }

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

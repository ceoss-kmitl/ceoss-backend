import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
  UseBefore,
} from 'routing-controllers'

import { schema } from '@middlewares/schema'
import { Subject } from '@models/subject'
import {
  ICreateSubject,
  IEditSubject,
  IGetSubjectCompensatedQuery,
  IPostSubjectCompensatedBody,
} from '@controllers/types/subject'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'
import { Workload } from '@models/workload'
import { Compensated } from '@models/compensated'
import { Room } from '@models/room'

@JsonController()
export class SubjectController {
  @Get('/subject/:subjectId/compensated')
  @UseBefore(schema(IGetSubjectCompensatedQuery, 'query'))
  async getSubjectCompensatedHistory(
    @Param('subjectId') subjectId: string,
    @QueryParams() query: IGetSubjectCompensatedQuery
  ) {
    const { academic_year, semester } = query

    const subject = await Subject.createQueryBuilder('subject')
      .leftJoinAndSelect(
        'subject.workloadList',
        'workloadList',
        'workloadList.academicYear = :academic_year AND workloadList.semester = :semester',
        { academic_year, semester }
      )
      .leftJoinAndSelect('workloadList.compensatedList', 'compensatedList')
      .leftJoinAndSelect('compensatedList.compensatedRoom', 'compensatedRoom')
      .where('subject.id = :subjectId', { subjectId })
      .orderBy('workloadList.section', 'ASC')
      .getOne()
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${subjectId} is not found`,
      ])

    const workloadGroupBySection: { section: number; compensatedList: any }[] =
      []
    for (const workload of subject.workloadList) {
      const listIndex = workloadGroupBySection.findIndex(
        (w) => w.section === workload.section
      )
      // New section
      if (listIndex === -1) {
        workloadGroupBySection.push({
          section: workload.section,
          compensatedList: [...workload.compensatedList],
        })
      } else {
        workloadGroupBySection[listIndex].compensatedList.push(
          ...workload.compensatedList
        )
      }
    }
    return workloadGroupBySection
  }

  @Post('/subject/:subjectId/compensated')
  @UseBefore(schema(IPostSubjectCompensatedBody))
  async createSubjectCompensated(
    @Param('subjectId') subjectId: string,
    @Body() body: IPostSubjectCompensatedBody
  ) {
    const {
      academicYear,
      semester,
      section,
      roomId,
      originalDate,
      compensatedDate,
    } = body

    const workload = await Workload.createQueryBuilder('workload')
      .innerJoinAndSelect(
        'workload.subject',
        'subject',
        'subject.id = :subjectId',
        { subjectId }
      )
      .where('workload.academicYear = :academicYear', { academicYear })
      .andWhere('workload.semester = :semester', { semester })
      .andWhere('workload.section = :section', { section })
      .getOne()
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานที่จะชดเชย', [
        `Workload with subject id ${subjectId} is not found`,
      ])

    const room = await Room.findOne({ where: { id: roomId } })
    if (roomId && !room)
      throw new NotFoundError('ไม่พบห้องดังกล่าว', [
        `Room ${roomId} is not found`,
      ])

    const compensated = new Compensated()
    compensated.originalDate = new Date(originalDate)
    compensated.compensatedDate = new Date(compensatedDate)
    compensated.compensatedRoom = room as Room
    compensated.workload = workload
    await compensated.save()

    return 'OK'
  }

  @Get('/subject')
  async getSubject() {
    const subjectList = await Subject.find({ order: { name: 'ASC' } })
    return subjectList
  }

  @Post('/subject')
  @UseBefore(schema(ICreateSubject))
  async create(@Body() body: ICreateSubject) {
    const {
      code,
      name,
      isRequired,
      credit,
      lectureHours,
      labHours,
      independentHours,
      curriculumCode,
      isInter,
    } = body

    const isExist = await Subject.findOneByCode(code)
    if (isExist)
      throw new BadRequestError('มีวิชานี้อยู่แล้วในระบบ', [
        `Subject ${code} already exist`,
      ])

    const subject = new Subject()
    subject.code = code
    subject.name = name
    subject.isRequired = isRequired
    subject.credit = credit
    subject.lectureHours = lectureHours
    subject.labHours = labHours
    subject.independentHours = independentHours
    subject.curriculumCode = curriculumCode
    subject.isInter = isInter

    await subject.save()
    return 'Created'
  }

  @Put('/subject/:id')
  @UseBefore(schema(IEditSubject))
  async edit(@Param('id') id: string, @Body() body: IEditSubject) {
    const {
      code,
      name,
      isRequired,
      credit,
      lectureHours,
      labHours,
      independentHours,
      curriculumCode,
      isInter,
    } = body
    const isExist = await Subject.findOneByCode(code)
    const isNotSelf = isExist?.id !== id
    if (isExist && isNotSelf)
      throw new BadRequestError('มีวิชานี้อยู่แล้วในระบบ', [
        `Subject ${id} already exist`,
      ])

    const subject = await Subject.findOne(id)
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${id} is not found`,
      ])

    subject.code = code ?? subject.code
    subject.name = name ?? subject.name
    subject.isRequired = isRequired ?? subject.isRequired
    subject.credit = credit ?? subject.credit
    subject.lectureHours = lectureHours ?? subject.lectureHours
    subject.labHours = labHours ?? subject.labHours
    subject.independentHours = independentHours ?? subject.independentHours
    subject.curriculumCode = curriculumCode ?? subject.curriculumCode
    subject.isInter = isInter ?? subject.isInter

    await subject.save()
    return 'Edited'
  }

  @Delete('/subject/:id')
  async delete(@Param('id') id: string) {
    const subject = await Subject.findOne(id)
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${id} is not found`,
      ])

    await subject.remove()
    return 'Deleted'
  }
}

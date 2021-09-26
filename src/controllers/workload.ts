import { Response } from 'express'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams,
  Res,
  UseBefore,
} from 'routing-controllers'
import {
  ICreateWorkload,
  IGetWorkloadExcel1Query,
  IGetWorkloadExcel2Query,
  ITeacherWorkloadQuery,
} from '@controllers/types/workload'
import { generateWorkloadExcel1 } from '@controllers/templates/workloadExcel1'
import { generateWorkloadExcel2 } from '@controllers/templates/workloadExcel2'
import { mapTimeToTimeSlot } from '@libs/mapper'
import { schema } from '@middlewares/schema'
import { DayOfWeek, Workload, WorkloadType } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
import { Time } from '@models/time'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class WorkloadController {
  @Get('/workload/excel-1')
  @UseBefore(schema(IGetWorkloadExcel1Query, 'query'))
  async getWorkloadExcel1(
    @Res() res: Response,
    @QueryParams() query: IGetWorkloadExcel1Query
  ) {
    const file = await generateWorkloadExcel1(res, query)
    return file
  }

  @Get('/workload/excel-2')
  @UseBefore(schema(IGetWorkloadExcel2Query, 'query'))
  async getWorkloadExcel2(
    @Res() res: Response,
    @QueryParams() query: IGetWorkloadExcel2Query
  ) {
    const file = await generateWorkloadExcel2(res, query)
    return file
  }

  @Get('/workload')
  @UseBefore(schema(ITeacherWorkloadQuery, 'query'))
  async getTeacherWorkload(@QueryParams() query: ITeacherWorkloadQuery) {
    const teacher = await Teacher.findOne(query.teacher_id, {
      relations: [
        'workloadList',
        'workloadList.subject',
        'workloadList.timeList',
      ],
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${query.teacher_id} is not found`,
      ])

    teacher.workloadList = teacher.workloadList.filter(
      (workload) =>
        workload.academicYear === query.academic_year &&
        workload.semester === query.semester
    )

    const result = [] as {
      dayInWeek: DayOfWeek
      subjectList: {
        id: string
        workloadId: string
        code: string
        name: string
        section: number
        startSlot: number
        endSlot: number
        type: WorkloadType
      }[]
    }[]

    for (let day = DayOfWeek.Monday; day <= DayOfWeek.Sunday; day++) {
      result.push({
        dayInWeek: day,
        subjectList: [],
      })
    }

    teacher.workloadList.forEach((workload) => {
      const thatDay = result[workload.dayOfWeek - 1]
      const { subject } = workload

      thatDay.subjectList.push({
        id: subject.id,
        code: subject.code,
        name: subject.name,
        section: workload.section,
        startSlot: workload.getFirstTimeSlot(),
        endSlot: workload.getLastTimeSlot(),
        type: workload.type,
        workloadId: workload.id,
      })
    })

    return result
  }

  @Post('/workload')
  @UseBefore(schema(ICreateWorkload))
  async createWorkload(@Body() body: ICreateWorkload) {
    const {
      teacherId,
      subjectId,
      roomId,
      type,
      degree,
      fieldOfStudy,
      section,
      dayOfWeek,
      timeList,
      academicYear,
      semester,
      isCompensated,
      classYear,
    } = body

    const teacher = await Teacher.findOne(teacherId, {
      relations: ['workloadList'],
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${teacherId} is not found`,
      ])

    const subject = await Subject.findOne(subjectId)
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${subjectId} is not found`,
      ])

    const room = await Room.findOne({ where: { id: roomId } })

    const workloadTimeList = timeList.map(({ startTime, endTime }) =>
      Time.create({
        startSlot: mapTimeToTimeSlot(startTime),
        endSlot: mapTimeToTimeSlot(endTime) - 1,
      })
    )

    const workload = new Workload()
    workload.subject = subject
    workload.room = room as any
    workload.type = type
    workload.degree = degree
    workload.fieldOfStudy = fieldOfStudy
    workload.section = section
    workload.dayOfWeek = dayOfWeek
    workload.timeList = workloadTimeList
    workload.academicYear = academicYear
    workload.semester = semester
    workload.isCompensated = isCompensated
    workload.classYear = classYear

    teacher.workloadList.push(workload)
    await teacher.save()
    return 'OK'
  }

  @Delete('/workload/:id')
  async discardWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne(id)
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload ${id} is not found`,
      ])

    await workload.remove()
    return 'Workload discarded'
  }
}

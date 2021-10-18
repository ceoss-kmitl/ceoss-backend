import { Response } from 'express'
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
import {
  IBodyExcelExternal,
  ICreateWorkload,
  IEditWorkload,
  IGetWorkloadExcelQuery,
  ITeacherWorkloadQuery,
} from '@controllers/types/workload'
import { generateWorkloadExcel1 } from '@controllers/templates/workloadExcel1'
import { generateWorkloadExcel2 } from '@controllers/templates/workloadExcel2'
import { generateWorkloadExcel3 } from '@controllers/templates/workloadExcel3'
import { generateWorkloadExcel3External } from '@controllers/templates/workloadExcel3External'
import { Excel } from '@libs/Excel'
import { mapTimeSlotToTime, mapTimeToTimeSlot } from '@libs/mapper'
import { cloneClass } from '@libs/utils'
import { schema } from '@middlewares/schema'
import { DayOfWeek, Degree, Workload, WorkloadType } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
import { Time } from '@models/time'
import { TeacherWorkload } from '@models/teacherWorkload'
import { NotFoundError } from '@errors/notFoundError'
import { IsNull } from 'typeorm'

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

  @Get('/workload')
  @UseBefore(schema(ITeacherWorkloadQuery, 'query'))
  async getTeacherWorkload(@QueryParams() query: ITeacherWorkloadQuery) {
    const teacher = await Teacher.findOne(query.teacher_id, {
      relations: [
        'teacherWorkloadList',
        'teacherWorkloadList.workload',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload.subject',
        'teacherWorkloadList.workload.timeList',
        'teacherWorkloadList.workload.teacherWorkloadList',
        'teacherWorkloadList.workload.teacherWorkloadList.workload',
        'teacherWorkloadList.workload.teacherWorkloadList.teacher',
      ],
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${query.teacher_id} is not found`,
      ])

    teacher.teacherWorkloadList = teacher.filterTeacherWorkloadList({
      academicYear: query.academic_year,
      semester: query.semester,
    })

    const result = [] as {
      workloadList: {
        id: string
        subjectId: string
        code: string
        name: string
        section: number
        type: WorkloadType
        fieldOfStudy: string
        degree: Degree
        classYear: number
        dayOfWeek: DayOfWeek
        startSlot: number
        endSlot: number
        timeList: { start: string; end: string }[]
        teacherList: {
          teacherId: string
          weekCount: number
          isClaim: boolean
        }[]
        isClaim: boolean
      }[]
    }[]

    for (let day = DayOfWeek.Monday; day <= DayOfWeek.Sunday; day++) {
      result.push({
        workloadList: [],
      })
    }

    for (const workload of teacher.getWorkloadList()) {
      const thatDay = result[workload.dayOfWeek - 1]
      const { subject } = workload

      thatDay.workloadList.push({
        id: workload.id,
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        section: workload.section,
        type: workload.type,
        fieldOfStudy: workload.fieldOfStudy,
        degree: workload.degree,
        classYear: workload.classYear,
        dayOfWeek: workload.dayOfWeek,
        startSlot: workload.getFirstTimeSlot(),
        endSlot: workload.getLastTimeSlot(),
        timeList: workload.timeList.map((time) => ({
          start: mapTimeSlotToTime(time.startSlot),
          end: mapTimeSlotToTime(time.endSlot + 1),
        })),
        teacherList: workload.getTeacherList().map((teacher) => ({
          teacherId: teacher.id,
          weekCount: workload.getWeekCount(teacher.id),
          isClaim: workload.getIsClaim(teacher.id),
        })),
        isClaim: workload.getIsClaim(query.teacher_id),
      })
    }

    return result
  }

  @Post('/workload')
  @UseBefore(schema(ICreateWorkload))
  async createWorkload(@Body() body: ICreateWorkload) {
    const {
      teacherList,
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
      classYear,
    } = body

    const subject = await Subject.findOne({ where: { id: subjectId } })
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${subjectId} is not found`,
      ])

    const room = await Room.findOne({ where: { id: roomId } })

    const workloadTimeList = timeList.map(([startTime, endTime]) =>
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
    workload.classYear = classYear
    workload.isCompensated = false

    for (const _teacher of teacherList) {
      const teacher = await Teacher.findOne({
        where: { id: _teacher.teacherId },
        relations: ['teacherWorkloadList'],
      })
      if (!teacher)
        throw new NotFoundError('ไม่พบรายชื่อผู้สอน', [
          `Teacher ${_teacher.teacherId} is not found`,
        ])

      const teacherWorkload = new TeacherWorkload()
      teacherWorkload.workload = await workload.save()
      teacherWorkload.teacher = teacher
      teacherWorkload.isClaim = _teacher.isClaim
      teacherWorkload.weekCount = _teacher.weekCount

      await teacherWorkload.save()
    }

    return 'OK'
  }

  @Put('/workload/:id')
  @UseBefore(schema(IEditWorkload))
  async editWorkload(@Param('id') id: string, @Body() body: IEditWorkload) {
    const { teacherList } = body
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
        `Workload ${id} is not found`,
      ])

    const tmpTeacherWorkloadList = []
    for (const teacher of teacherList) {
      const teacherWorkload = workload.getTeacherWorkload(teacher.teacherId)
      if (!teacherWorkload)
        throw new NotFoundError('ไม่พบภาระงานของผู้สอน', [
          `TeacherWorkload of teacher ${teacher.teacherId} is not found`,
        ])

      teacherWorkload.isClaim = teacher.isClaim
      teacherWorkload.weekCount = teacher.weekCount

      tmpTeacherWorkloadList.push(teacherWorkload)
    }

    for (const tw of tmpTeacherWorkloadList) {
      await tw.save()
    }
    return 'Workload Edited'
  }

  @Delete('/workload/:id')
  async deleteWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne({ where: { id } })
    if (!workload)
      throw new NotFoundError('ไม่พบภาระงานดังกล่าว', [
        `Workload ${id} is not found`,
      ])

    await workload.remove()
    return 'Workload discarded'
  }

  @Get('/workload/no-room')
  async getWorkloadWithUnAssignedRoom() {
    const workloadList = await Workload.find({
      relations: [
        'room',
        'subject',
        'timeList',
        'teacherWorkloadList',
        'teacherWorkloadList.teacher',
        'teacherWorkloadList.workload',
      ],
      where: {
        room: IsNull(),
      },
    })

    return workloadList.map((workload) => ({
      workloadId: workload.id,
      subjectCode: workload.subject.code,
      subjectName: workload.subject.name,
      section: workload.section,
      dayOfWeek: workload.dayOfWeek,
      startTime: mapTimeSlotToTime(workload.getFirstTimeSlot()),
      endTime: mapTimeSlotToTime(workload.getLastTimeSlot() + 1),
      teacherList: workload
        .getTeacherList()
        .map((teacher) => teacher.getFullName()),
    }))
  }
}

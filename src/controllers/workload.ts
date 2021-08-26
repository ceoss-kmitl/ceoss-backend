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
} from '@controllers/types/workload'
import { generateWorkloadExcel1 } from '@controllers/templates/workloadExcel1'
import { mapTimeToTimeSlot } from '@libs/mapper'
import { schema } from '@middlewares/schema'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
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

  @Post('/workload')
  @UseBefore(schema(ICreateWorkload))
  async createWorkload(@Body() body: ICreateWorkload) {
    const {
      teacherId,
      subjectId,
      roomId,
      type,
      fieldOfStudy,
      section,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
      semester,
      isCompensated,
    } = body

    const teacher = await Teacher.findOne(teacherId, {
      relations: ['workloadList'],
    })
    if (!teacher) throw new NotFoundError(`Teacher ${teacherId} is not found`)

    const subject = await Subject.findOne(subjectId)
    if (!subject) throw new NotFoundError(`Subject ${subjectId} is not found`)

    const room = await Room.findOne({ where: { id: roomId } })

    const workload = new Workload()
    workload.subject = subject
    workload.room = room as any
    workload.type = type
    workload.fieldOfStudy = fieldOfStudy
    workload.section = section
    workload.dayOfWeek = dayOfWeek
    workload.startTimeSlot = mapTimeToTimeSlot(startTime)
    workload.endTimeSlot = mapTimeToTimeSlot(endTime) - 1
    workload.academicYear = academicYear
    workload.semester = semester
    workload.isCompensated = isCompensated

    teacher.workloadList.push(workload)
    await teacher.save()
    return 'OK'
  }

  @Delete('/workload/:id')
  async discardWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne(id)
    if (!workload) throw new NotFoundError(`Workload ${id} is not found`)

    await workload.remove()
    return 'Workload discarded'
  }
}

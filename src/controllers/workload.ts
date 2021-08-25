import { Response } from 'express'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Res,
  UseBefore,
} from 'routing-controllers'
import { Excel, PaperSize } from '@libs/Excel'
import { mapTimeToTimeSlot } from '@libs/mapper'
import { ICreateWorkload } from '@controllers/types/workload'
import { schema } from '@middlewares/schema'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Room } from '@models/room'
import { Teacher } from '@models/teacher'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class WorkloadController {
  // TODO: Remove this endpoint when start writing real excel file
  @Get('/workload-demo')
  async demo(@Res() res: Response) {
    const excel = new Excel(res, {
      pageSetup: { paperSize: PaperSize.A4 },
      properties: {
        defaultColWidth: Excel.pxCol(16),
        defaultRowHeight: Excel.pxRow(17),
      },
    })

    excel.cell('A1').value('Hello').italic()
    excel.cell('B3').value('World').border('bottom', 'left')
    excel.cells('C1', 'D3').value('Merge!').bold().align('center', 'middle')
    excel.cell('A4').border('diagonal-down', 'diagonal-up')
    excel.cell('A5').border('diagonal-down')
    excel.cell('A6').border('diagonal-up')
    let total = 0
    for (let i = 8; i <= 12; i++) {
      excel.cell(`A${i}`).value(i)
      total += i
    }
    excel.cell('A13').formula('SUM(A8:A12)', total)

    return excel.sendFile('demo-file')
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

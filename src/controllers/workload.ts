import { Response } from 'express'
import {
  Delete,
  Get,
  JsonController,
  Param,
  QueryParams,
  Res,
  UseBefore,
} from 'routing-controllers'
import { ITeacherWorkloadQuery } from '@controllers/types/workload'
import { schema } from '@middlewares/schema'
import { Excel, PaperSize } from '@libs/Excel'
import { Workload, DayOfWeek, WorkloadType } from '@models/workload'
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

    return excel.sendFile('demo-file')
  }

  @Get('/workload')
  @UseBefore(schema(ITeacherWorkloadQuery, 'query'))
  async getWorkloadByTeacherId(@QueryParams() query: ITeacherWorkloadQuery) {
    const teacher = await Teacher.findOne(query.teacher_id, {
      relations: ['workloadList', 'workloadList.subject'],
    })
    if (!teacher)
      throw new NotFoundError(`Teacher ${query.teacher_id} is not found`)

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
        startSlot: workload.startTimeSlot,
        endSlot: workload.endTimeSlot,
        type: workload.type,
        workloadId: workload.id,
      })
    })

    return result
  }

  @Delete('/workload/:id')
  async discardWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne(id)
    if (!workload) throw new NotFoundError(`Workload ${id} is not found`)

    await workload.remove()
    return 'Workload discarded'
  }
}

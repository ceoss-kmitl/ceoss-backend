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
import {
  ICreateTeacher,
  IEditTeacher,
  ITeacherWorkloadQuery,
  ITeacherWorkloadResult,
} from '@controllers/types/teacher'

import { DayOfWeek } from '@models/workload'
import { Teacher } from '@models/teacher'
import { schema } from '@middlewares/schema'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class TeacherController {
  @Get('/teacher')
  async getTeacher() {
    const TeacherList = await Teacher.find()
    return TeacherList
  }

  @Post('/teacher')
  @UseBefore(schema(ICreateTeacher))
  async createTeacher(@Body() body: ICreateTeacher) {
    const { name, title, isExecutive } = body

    const teacher = new Teacher()
    teacher.name = name
    teacher.title = title
    teacher.isExecutive = isExecutive

    await teacher.save()
    return 'Created'
  }

  @Put('/teacher/:id')
  @UseBefore(schema(IEditTeacher))
  async edit(@Param('id') id: string, @Body() body: IEditTeacher) {
    const { name, title, isExecutive } = body

    const teacher = await Teacher.findOne(id)
    if (!teacher) throw new NotFoundError(id)

    teacher.name = name ?? teacher.name
    teacher.title = title ?? teacher.title
    teacher.isExecutive = isExecutive ?? teacher.isExecutive

    await teacher.save()
    return 'Edited'
  }

  @Delete('/teacher/:id')
  async delete(@Param('id') id: string) {
    const teacher = await Teacher.findOne(id)
    if (!teacher) throw new NotFoundError(`Teacher ${id} is not found`)

    await teacher.softRemove()
    return 'Deleted'
  }

  @Get('/teacher/:id/workload')
  @UseBefore(schema(ITeacherWorkloadQuery, 'query'))
  async getWorkloadByTeacherId(
    @Param('id') id: string,
    @QueryParams() query: ITeacherWorkloadQuery
  ) {
    const teacher = await Teacher.findOne(id, {
      relations: ['workloadList', 'workloadList.subject'],
    })
    if (!teacher) throw new NotFoundError(`Teacher ${id} is not found`)

    teacher.workloadList = teacher.workloadList.filter(
      (workload) =>
        workload.academicYear === query.academic_year &&
        workload.semester === query.semester
    )
    const result: ITeacherWorkloadResult[] = []

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
}

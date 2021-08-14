import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  UseBefore,
} from 'routing-controllers'
import {
  ICreateTeacher,
  IEditTeacher,
  ITeacherWorkload,
} from '@controllers/types/teacher'

import { DayOfWeek } from '@models/workload'
import { Teacher } from '@models/teacher'
import { schema } from '@middlewares/schema'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class TeacherController {
  @Get('/teacher')
  async getTeacher() {
    const teacherList = await Teacher.find()

    return teacherList.map((teacher) => {
      const modifyTeacher = { ...teacher } as Partial<Teacher>
      delete modifyTeacher.createdAt
      delete modifyTeacher.updatedAt
      delete modifyTeacher.deletedAt
      return modifyTeacher
    })
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
  async getWorkloadByTeacherId(@Param('id') id: string) {
    const teacher = await Teacher.findOne(id, {
      relations: ['workloadList', 'workloadList.subject'],
    })
    if (!teacher) throw new NotFoundError(`Teacher ${id} is not found`)

    const teacherWorkload: ITeacherWorkload[] = []

    for (let day = DayOfWeek.Monday; day <= DayOfWeek.Sunday; day++) {
      teacherWorkload.push({
        dayInWeek: day,
        subjectList: [],
      })
    }

    const { workloadList } = teacher
    workloadList.forEach((workload) => {
      const thatDay = teacherWorkload[workload.dayOfWeek - 1]
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

    return teacherWorkload
  }
}

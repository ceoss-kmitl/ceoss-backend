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

import { Teacher } from '@models/teacher'
import { schema } from '@middlewares/schema'
import { ICreateTeacher, IEditTeacher } from '@controllers/types/teacher'
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
}

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

import {
  ICreateTeacher,
  IEditTeacher,
  IGetTeacherQuery,
} from '@controllers/types/teacher'
import { Teacher } from '@models/teacher'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class TeacherController {
  @Get('/teacher')
  @ValidateQuery(IGetTeacherQuery)
  async getTeacher(@QueryParams() query: IGetTeacherQuery) {
    const filterOption =
      query.is_active === undefined ? {} : { isActive: query.is_active }
    const teacherList = await Teacher.find({
      order: { name: 'ASC' },
      where: { ...filterOption },
    })
    return teacherList
  }

  @Post('/teacher')
  @ValidateBody(ICreateTeacher)
  async createTeacher(@Body() body: ICreateTeacher) {
    const { name, title, executiveRole, isActive, isExternal } = body

    const teacher = new Teacher()
    teacher.name = name.trim()
    teacher.title = title
    teacher.executiveRole = executiveRole.trim()
    teacher.isActive = isActive
    teacher.isExternal = isExternal

    await teacher.save()
    return 'Created'
  }

  @Put('/teacher/:id')
  @ValidateBody(IEditTeacher)
  async edit(@Param('id') id: string, @Body() body: IEditTeacher) {
    const { name, title, executiveRole, isActive, isExternal } = body

    const teacher = await Teacher.findOne({ where: { id } })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${id} is not found`,
      ])

    teacher.name = name?.trim() ?? teacher.name
    teacher.title = title ?? teacher.title
    teacher.executiveRole = executiveRole?.trim() ?? teacher.executiveRole
    teacher.isActive = isActive ?? teacher.isActive
    teacher.isExternal = isExternal ?? teacher.isExternal

    await teacher.save()
    return 'Edited'
  }

  @Delete('/teacher/:id')
  async delete(@Param('id') id: string) {
    const teacher = await Teacher.findOne({ where: { id } })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher ${id} is not found`,
      ])

    await teacher.remove()
    return 'Deleted'
  }
}

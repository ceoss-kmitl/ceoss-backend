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
import { Not } from 'typeorm'
import { isNil, merge, omitBy } from 'lodash'

import {
  ICreateTeacher,
  IEditTeacher,
  IGetTeacherQuery,
} from '@controllers/types/teacher'
import { Teacher } from '@models/teacher'
import { ValidateBody, ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'

@JsonController()
export class TeacherController {
  // =============
  // CRUD Endpoint
  // =============

  @Get('/teacher')
  @ValidateQuery(IGetTeacherQuery)
  async getTeacher(@QueryParams() query: IGetTeacherQuery) {
    const teacherList = await Teacher.find({
      where: { ...query },
      order: { name: 'ASC' },
    })
    return teacherList
  }

  @Post('/teacher')
  @ValidateBody(ICreateTeacher)
  async createTeacher(@Body() body: ICreateTeacher) {
    const isExist = await Teacher.findOne({
      where: { name: body },
    })
    if (isExist)
      throw new BadRequestError('มีอาจารย์ชื่อนี้ในระบบอยู่แล้ว', [
        `Teacher name(${body.name}) already exists`,
      ])

    const payload = omitBy(body, isNil)
    const teacher = new Teacher()
    merge(teacher, payload)

    await teacher.save()
    return 'Created'
  }

  @Put('/teacher/:id')
  @ValidateBody(IEditTeacher)
  async edit(@Param('id') id: string, @Body() body: IEditTeacher) {
    const teacher = await Teacher.findOne({
      where: { id },
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    const isExist = await Teacher.findOne({
      where: {
        id: Not(id),
        name: body.name,
      },
    })
    if (isExist)
      throw new BadRequestError('มีอาจารย์ชื่อนี้ในระบบอยู่แล้ว', [
        `Teacher name(${body.name}) already exists`,
      ])

    const payload = omitBy(body, isNil)
    merge(teacher, payload)

    await teacher.save()
    return 'Edited'
  }

  @Delete('/teacher/:id')
  async delete(@Param('id') id: string) {
    const teacher = await Teacher.findOne({
      where: { id },
    })
    if (!teacher)
      throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
        `Teacher id(${id}) is not found`,
      ])

    await teacher.remove()
    return 'Deleted'
  }
}

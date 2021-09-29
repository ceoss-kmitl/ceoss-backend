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

import { schema } from '@middlewares/schema'
import { Subject } from '@models/subject'
import { ICreateSubject, IEditSubject } from '@controllers/types/subject'
import { NotFoundError } from '@errors/notFoundError'
import { BadRequestError } from '@errors/badRequestError'

@JsonController()
export class SubjectController {
  @Get('/subject')
  async getSubject() {
    const subjectList = await Subject.find({ order: { name: 'ASC' } })
    return subjectList
  }

  @Post('/subject')
  @UseBefore(schema(ICreateSubject))
  async create(@Body() body: ICreateSubject) {
    const {
      code,
      name,
      isRequired,
      credit,
      lectureHours,
      labHours,
      independentHours,
      curriculumCode,
      isInter,
    } = body

    const isExist = await Subject.findOneByCode(code)
    if (isExist)
      throw new BadRequestError('มีวิชานี้อยู่แล้วในระบบ', [
        `Subject ${code} already exist`,
      ])

    const subject = new Subject()
    subject.code = code
    subject.name = name
    subject.isRequired = isRequired
    subject.credit = credit
    subject.lectureHours = lectureHours
    subject.labHours = labHours
    subject.independentHours = independentHours
    subject.curriculumCode = curriculumCode
    subject.isInter = isInter

    await subject.save()
    return 'Created'
  }

  @Put('/subject/:id')
  @UseBefore(schema(IEditSubject))
  async edit(@Param('id') id: string, @Body() body: IEditSubject) {
    const {
      code,
      name,
      isRequired,
      credit,
      lectureHours,
      labHours,
      independentHours,
      curriculumCode,
      isInter,
    } = body
    const isExist = await Subject.findOneByCode(code)
    const isNotSelf = isExist?.id !== id
    if (isExist && isNotSelf)
      throw new BadRequestError('มีวิชานี้อยู่แล้วในระบบ', [
        `Subject ${id} already exist`,
      ])

    const subject = await Subject.findOne(id)
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${id} is not found`,
      ])

    subject.code = code ?? subject.code
    subject.name = name ?? subject.name
    subject.isRequired = isRequired ?? subject.isRequired
    subject.credit = credit ?? subject.credit
    subject.lectureHours = lectureHours ?? subject.lectureHours
    subject.labHours = labHours ?? subject.labHours
    subject.independentHours = independentHours ?? subject.independentHours
    subject.curriculumCode = curriculumCode ?? subject.curriculumCode
    subject.isInter = isInter ?? subject.isInter

    await subject.save()
    return 'Edited'
  }

  @Delete('/subject/:id')
  async delete(@Param('id') id: string) {
    const subject = await Subject.findOne(id)
    if (!subject)
      throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
        `Subject ${id} is not found`,
      ])

    await subject.remove()
    return 'Deleted'
  }
}

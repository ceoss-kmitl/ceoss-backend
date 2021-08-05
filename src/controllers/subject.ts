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

@JsonController()
export class SubjectController {
  @Get('/subject')
  async getSubject() {
    const SubjectList = await Subject.find()
    return SubjectList
  }

  @Post('/subject')
  @UseBefore(schema(ICreateSubject))
  async createTeacher(@Body() body: ICreateSubject) {
    const {
      code,
      name,
      isRequired,
      credit,
      lectureHours,
      labHours,
      independentHours,
    } = body

    const subject = new Subject()
    subject.code = code
    subject.name = name
    subject.isRequired = isRequired
    subject.credit = credit
    subject.lectureHours = lectureHours
    subject.labHours = labHours
    subject.independentHours = independentHours

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
    } = body

    const subject = await Subject.findOne(id)
    if (!subject) throw new NotFoundError(`Subject ${id} is not found`)

    subject.code = code ?? subject.code
    subject.name = name ?? subject.name
    subject.isRequired = isRequired ?? subject.isRequired
    subject.credit = credit ?? subject.credit
    subject.lectureHours = lectureHours ?? subject.lectureHours
    subject.labHours = labHours ?? subject.labHours
    subject.independentHours = independentHours ?? subject.independentHours

    await subject.save()
    return 'Edited'
  }

  @Delete('/subject/:id')
  async delete(@Param('id') id: string) {
    const subject = await Subject.findOne(id)
    if (!subject) throw new NotFoundError(`Subject ${id} is not found`)

    await subject.softRemove()
    return 'Deleted'
  }
}

import { Body, JsonController, Post } from 'routing-controllers'
import { get } from 'lodash'

import { ValidateBody } from '@middlewares/validator'
import { Teacher } from '@models/teacher'

import { ISyncTeacherBody } from './types/sync'
import { BadRequestError } from '@errors/badRequestError'

@JsonController()
export class SyncController {
  @Post('/sync/teacher')
  @ValidateBody(ISyncTeacherBody)
  async syncTeacher(@Body() body: ISyncTeacherBody) {
    const titleRegex = new RegExp(/(.+)\./)

    const syncList = <Teacher[]>[]
    for (const [i, _teacher] of body.data.entries()) {
      const title = get(_teacher['ชื่อ-สกุล'].match(titleRegex), 0, '').trim()
      const name = _teacher['ชื่อ-สกุล']
        .replace(titleRegex, '')
        .split(/\s+/)
        .map((each) => each.trim())
        .join(' ')
      if (!title) {
        throw new BadRequestError('รูปแบบข้อมูลไม่ถูกต้อง', [
          `Data #${i + 1} has invalid format (${_teacher['ชื่อ-สกุล']}) `,
        ])
      }

      const teacher =
        (await Teacher.findOne({ where: { name } })) || new Teacher()
      teacher.title = title
      teacher.name = name
      teacher.executiveRole = _teacher.ตำแหน่งบริหาร
      teacher.isActive = true
      teacher.isExternal = _teacher.อาจารย์ภายนอก

      syncList.push(teacher)
    }
    const result = await Teacher.save(syncList)

    return {
      syncCount: result.length,
      result: result.map((each) => each.getFullName()),
    }
  }
}

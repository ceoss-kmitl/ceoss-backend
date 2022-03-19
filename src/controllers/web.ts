import { Authorized, Body, Get, JsonController, Put } from 'routing-controllers'

import { Web } from '@models/web'
import { ValidateBody } from '@middlewares/validator'

import { IUpsertWeb } from './types/web'
import { BadRequestError } from '@errors/badRequestError'

@JsonController()
export class WebController {
  @Get('/web')
  @Authorized()
  async getWebList() {
    const webList = await Web.find()
    return webList
  }

  @Put('/web')
  @ValidateBody(IUpsertWeb)
  @Authorized()
  async upsertWebList(@Body() body: IUpsertWeb) {
    const { webList } = body
    const newRegUrl = 'https://new.reg.kmitl.ac.th/reg/#/teach_table?'

    const willBeSaveList: Web[] = []
    const willBeDeleteList: Web[] = []

    for (const _web of webList) {
      if (!_web.url.startsWith(newRegUrl)) {
        throw new BadRequestError('เว็บไซต์ดังกล่าวไม่ใช่เว็บสำนักทะเบียน', [
          `Invalid web url pattern : web id(${_web.id})`,
        ])
      }

      const web = (await Web.findOne({ where: { id: _web.id } })) || new Web()
      web.id = _web.id
      web.url = _web.url
      willBeSaveList.push(web)
    }

    const allWebList = await Web.find()
    for (const _web of allWebList) {
      const found = willBeSaveList.find((w) => w.id === _web.id)
      if (found) {
        continue
      }
      willBeDeleteList.push(_web)
    }

    await Web.save(willBeSaveList)
    await Web.remove(willBeDeleteList)
    return 'Update web'
  }
}

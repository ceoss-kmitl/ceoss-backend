import { JsonController, Get, Body, Put } from 'routing-controllers'
import { merge } from 'lodash'

import { IEditSetting } from '@controllers/types/setting'
import { Setting } from '@models/setting'
import { ValidateBody } from '@middlewares/validator'

@JsonController()
export class SettingController {
  @Get('/setting')
  async getSetting() {
    const setting = await Setting.get()
    return setting
  }

  @Put('/setting')
  @ValidateBody(IEditSetting)
  async editSetting(@Body() body: IEditSetting) {
    const setting = await Setting.get()
    merge(setting, body)
    await setting.save()
    return 'Setting Edited'
  }
}

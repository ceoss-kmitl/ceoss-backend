import { JsonController, Get, UseBefore, Body, Put } from 'routing-controllers'

import { IEditSetting } from 'controllers/types/setting'
import { schema } from 'middlewares/schema'
import { Setting } from 'models/setting'

@JsonController()
export class SettingController {
  @Get('/setting')
  async getSetting() {
    const setting = await Setting.get()
    return setting
  }

  @Put('/setting')
  @UseBefore(schema(IEditSetting))
  async editSetting(@Body() body: IEditSetting) {
    const {
      deanName,
      viceDeanName,
      headName,
      directorSIIEName,
      lecturePayRateNormal,
      labPayRateNormal,
      lecturePayRateInter,
      labPayRateInter,
      lecturePayRateExternal,
      labPayRateExternal,
      normalClaimLimit,
      interClaimLimit,
      webScrapUrl,
    } = body

    const setting = await Setting.get()
    setting.deanName = deanName ?? setting.deanName
    setting.viceDeanName = viceDeanName ?? setting.viceDeanName
    setting.headName = headName ?? setting.headName
    setting.directorSIIEName = directorSIIEName ?? setting.directorSIIEName
    setting.lecturePayRateNormal =
      lecturePayRateNormal ?? setting.lecturePayRateNormal
    setting.labPayRateNormal = labPayRateNormal ?? setting.labPayRateNormal
    setting.lecturePayRateInter =
      lecturePayRateInter ?? setting.lecturePayRateInter
    setting.labPayRateInter = labPayRateInter ?? setting.labPayRateInter
    setting.lecturePayRateExternal =
      lecturePayRateExternal ?? setting.lecturePayRateExternal
    setting.labPayRateExternal =
      labPayRateExternal ?? setting.labPayRateExternal
    setting.normalClaimLimit = normalClaimLimit ?? setting.normalClaimLimit
    setting.interClaimLimit = interClaimLimit ?? setting.interClaimLimit
    setting.webScrapUrl = webScrapUrl ?? setting.webScrapUrl

    await setting.save()
    return 'Setting Edited'
  }
}

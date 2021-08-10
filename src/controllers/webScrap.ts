import { Get, JsonController } from 'routing-controllers'
import { WebScrap } from '@libs/WebScrap'

@JsonController()
export class WebScrapController {
  @Get('/web-scrap')
  async scrapDataFromRegKMITL() {
    const URL =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1'
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    return data
  }
}

import { Get, JsonController } from 'routing-controllers'
import { WebScrap } from '@libs/WebScrap'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Teacher } from '@models/teacher'

@JsonController()
export class WebScrapController {
  @Get('/web-scrap')
  async scrapDataFromRegKMITL() {
    const URL =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1'
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    data.forEach((_year) => {
      _year.subjectList.forEach((_subject) => {
        _subject.sectionList.forEach(async (_section) => {
          const subject = await Subject.findByCode(_subject.subjectCode)

          const workload = new Workload()
          workload.subject = subject as Subject
          workload.section = _section.section
          workload.type = _section.subjectType
          workload.dayOfWeek = _section.dayOfWeek
          workload.startTimeSlot = _section.startTimeSlot
          workload.endTimeSlot = _section.endTimeSlot
          workload.isCompensated = false
          await workload.save()
          console.log({ ...workload })

          _section.teacherList.forEach(async (_teacher) => {
            const teacher = await Teacher.findByName(_teacher.name)

            teacher?.workloadList.push(workload)
            await teacher?.save()
          })
        })
      })
    })

    return data
  }
}
